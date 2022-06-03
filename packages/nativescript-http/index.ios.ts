import { File, knownFolders, Utils } from '@nativescript/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import urljoin from 'url-join';
import {
  CreateHttp,
  getResponseError,
  HttpError,
  HttpRequestHeaders,
  IHttpRequest,
  IHttpResponse,
  loopHeaders,
  MultiPartRequestBody,
  printContentSummary,
  printHeaders,
  TransientError,
} from './common';

export const createHttp: CreateHttp = (baseUrl, log?) => {
  log = log ?? (() => {});
  log(`USING HTTP BASE URL: '${baseUrl}'`);

  let def_session;
  const getSession = () => {
    if (!def_session) {
      def_session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
        NSURLSessionConfiguration.defaultSessionConfiguration,
        null,
        NSOperationQueue.mainQueue
      );
    }
    return def_session as NSURLSession;
  };

  const parseContent = (data: NSDictionary<string, any> & NSData & NSArray<any>) => {
    let content;
    if (data && data.class) {
      if (data.enumerateKeysAndObjectsUsingBlock || data.class().name === 'NSArray') {
        const serial = NSJSONSerialization.dataWithJSONObjectOptionsError(
          data,
          NSJSONWritingOptions.PrettyPrinted
        );
        content = NSString.alloc().initWithDataEncoding(serial, NSUTF8StringEncoding).toString();
      } else {
        try {
          content = NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding).toString();
        } catch (_) {
          try {
            content = NSString.alloc().initWithDataEncoding(data, NSASCIIStringEncoding).toString();
          } catch (_) {
            content = data;
          }
        }
      }
      try {
        content = JSON.parse(content);
      } catch (_) {
        content = data;
      }
    } else {
      content = data;
    }
    return content;
  };

  const createFromSuccessResponse = (
    res: NSHTTPURLResponse,
    content: any
  ): IHttpResponse | HttpError => {
    if (Utils.isNullOrUndefined(res)) {
      throw new Error('error.gen');
    }
    const statusCode = res && res.statusCode;
    const error = getResponseError(statusCode);

    const headers = {};
    const dict = res.allHeaderFields;
    dict.enumerateKeysAndObjectsUsingBlock((k, v) => {
      headers[k] = v;
    });
    const body = parseContent(content);
    const response: IHttpResponse = {
      statusCode,
      headers,
      text: () => of(body),
      json: () => of(body),
      bytes: () => of(null),
      save: (fileName: string) =>
        new Observable((o) => {
          const file = File.fromPath(fileName);
          file.writeSync(body, (e) => o.error(e));
          o.next();
          o.complete();
        }),
    };

    if (error) {
      error.response = response;
      return error;
    }

    return response;
  };

  const createRequestHeaders = (headers: HttpRequestHeaders, req: NSMutableURLRequest) =>
    loopHeaders(headers, (key, value) => req.addValueForHTTPHeaderField(value, key));

  const createRequest = (options: IHttpRequest) => {
    const url = <string>urljoin(baseUrl, options.url);
    const req = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    req.HTTPMethod = options.method;
    createRequestHeaders(options.headers, req);
    if (Utils.isNullOrUndefined(options.content)) {
      return { req };
    }
    const content = options.content;
    let multiPartFilePath: string;
    switch (content.type) {
      case 'text':
        req.HTTPBody = NSString.stringWithString(content.text).dataUsingEncoding(
          NSUTF8StringEncoding
        );
        req.setValueForHTTPHeaderField(content.mediaType, 'Content-Type');
        break;
      case 'json':
        req.HTTPBody = NSString.stringWithString(JSON.stringify(content.value)).dataUsingEncoding(
          NSUTF8StringEncoding
        );
        req.setValueForHTTPHeaderField(content.mediaType, 'Content-Type');
        break;
      case 'multipart':
        const { header, uploadPath } = createMultiPart(content);
        multiPartFilePath = uploadPath;
        req.setValueForHTTPHeaderField(header['Content-Type'], 'Content-Type');
        break;
    }
    return { req, multiPartFilePath };
  };

  const random = () => Math.floor(Math.random() * 100000000000);

  const generateMultiPartFile = (
    params: {
      name: string;
      filename: string;
      value?: string;
      mediaType?: string;
    }[]
  ) => {
    const boundary = `--------------formboundary${random()}`;
    const header = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    };
    const CRLF = '\r\n';
    const uploadPath = `${knownFolders.documents().path}/tmp-mp-${random()}.tmp`;
    const combinedData = NSMutableData.alloc().init();
    const appendData = (res: string) => {
      const tmpString = NSString.stringWithString(res);
      const newData = tmpString.dataUsingEncoding(NSUTF8StringEncoding);
      combinedData.appendData(newData);
    };
    let results = '';
    for (const param of params) {
      results += `--${boundary}${CRLF}`;
      results += `Content-Disposition: form-data; name="${param.name}"`;
      if (param.value) {
        results += CRLF + CRLF + param.value + CRLF;
      } else {
        results += `; filename="${param.filename}"`;
        results += `${CRLF}Content-Type: ${param.mediaType}`;
        results += CRLF + CRLF;
      }
      appendData(results);
      results = '';

      if (!param.value) {
        const fileData = NSData.alloc().initWithContentsOfFile(param.filename);
        combinedData.appendData(fileData);
        results = CRLF;
      }
    }
    // Final part
    results += `--${boundary}--${CRLF}`;
    appendData(results);

    const fm = NSFileManager.defaultManager;
    fm.createFileAtPathContentsAttributes(uploadPath, combinedData, null);
    return { uploadPath, header };
  };

  const createMultiPart = (content: MultiPartRequestBody) => {
    const params = [];
    for (const part of content.parts) {
      switch (part.type) {
        case 'form-file':
          if (part.body.type === 'json') {
            params.push({
              name: part.name,
              filename: part.fileName,
              value: JSON.stringify(part.body.value),
            });
          } else if (part.body.type === 'file') {
            params.push({
              name: part.name,
              filename: part.fileName,
              mediaType: part.body.mediaType,
            });
          }
          break;
        default:
          break;
      }
    }
    return generateMultiPartFile(params);
  };

  return {
    request: (options: IHttpRequest): Observable<IHttpResponse> =>
      new Observable<{ res: NSHTTPURLResponse; content: any }>((obs) => {
        log(`REQUEST: ${options.method}: ${options.url}`);
        log(() => printHeaders(options.headers));
        log(() => printContentSummary(options.content));

        const onSuccess = (res: NSHTTPURLResponse, content: NSMutableDictionary<any, any>) => {
          obs.next({ res, content });
          obs.complete();
        };

        const onFailure = (res: NSHTTPURLResponse, error: NSError) => {
          if (!res) {
            log(`Connectivity error with url '${options.url}': ${error.description}`);
            obs.error(new TransientError('error.connectivity'));
          }
          const data = error.userInfo.valueForKey(NSErrorFailingURLStringKey) as NSData;
          let body = NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding).toString();
          try {
            body = JSON.parse(body);
          } catch (e) {}
          const content = {
            body,
            description: error.description,
            reason: error.localizedDescription,
            // url: error.userInfo.objectForKey(
            //     "NSErrorFailingURLKey"
            // ),
          };
          obs.next({ res, content });
          obs.complete();
        };

        const handler =
          (extrahandler?: () => void) => (data: NSData, res: NSHTTPURLResponse, e: NSError) => {
            e ? onFailure(res, e) : onSuccess(res, data as any);
            extrahandler ? extrahandler() : {};
          };

        const { req, multiPartFilePath } = createRequest(options);
        const session = getSession();
        let task: NSURLSessionDataTask;

        if (multiPartFilePath) {
          task = session.uploadTaskWithRequestFromFileCompletionHandler(
            req,
            NSURL.URLWithString(multiPartFilePath),
            handler(() => {
              const fm = NSFileManager.defaultManager;
              fm.removeItemAtPathError(multiPartFilePath);
            })
          );
        } else {
          task = session.dataTaskWithRequestCompletionHandler(req, handler());
        }
        task.resume();
        return task ? () => task.cancel() : () => {};
      }).pipe(
        map(({ content, res }) => createFromSuccessResponse(res, content)),
        map((response) => {
          if (response instanceof Error) {
            log(() => `${response.name}: ${response.message}`);
            throw response;
          } else {
            log(`RESPONSE TO: ${options.method}: ${options.url}`);
            log(`STATUS: ${response.statusCode}`);
            log(() => printHeaders(response.headers));
            return response;
          }
        })
      ),
  };
};

export * from './common';
