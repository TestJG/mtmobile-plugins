import { Utils } from '@nativescript/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import urljoin from 'url-join';
import {
  CreateHttp,
  getResponseError,
  HttpError,
  HttpRequestHeaders,
  HttpResponseHeaders,
  IHttpRequest,
  IHttpResponse,
  loopHeaders,
  printContentSummary,
  printHeaders,
  RequestBody,
  TransientError,
} from './common';

export const createHttp: CreateHttp = (baseUrl, log?) => {
  log = log ?? (() => {});

  log(`USING HTTP BASE URL: '${baseUrl}'`);

  const closureC = {
    client: null as okhttp3.OkHttpClient,
  };

  const client = () => {
    if (!closureC.client) {
      const builder = new okhttp3.OkHttpClient.Builder();
      // builder.readTimeout(30, java.util.concurrent.TimeUnit.SECONDS);
      closureC.client = builder.build();
      // closure.client = new okhttp3.OkHttpClient();
    }
    return closureC.client;
  };

  const createRequestHeaders = (headers: HttpRequestHeaders): okhttp3.Headers => {
    if (Utils.isNullOrUndefined(headers)) return new okhttp3.Headers.Builder().build();

    const builder = new okhttp3.Headers.Builder();

    loopHeaders(headers, (name, value) => builder.add(name, value));

    return builder.build();
  };

  const createResponseHeaders = (headers: okhttp3.Headers): HttpResponseHeaders => {
    if (Utils.isNullOrUndefined(headers)) return {};

    const namesArr = headers.names().toArray();
    const names: string[] = [];
    for (let index = 0; index < namesArr.length; index++) {
      names[index] = String(namesArr[index]);
    }

    const result = {};

    for (const name of names) {
      result[name] = headers.values(name).toArray() as string[];
    }

    return result;
  };

  const createRequestBody = (content: RequestBody): okhttp3.RequestBody => {
    if (Utils.isNullOrUndefined(content)) {
      return null;
    }

    const mediaType = okhttp3.MediaType.parse(content.mediaType);

    switch (content.type) {
      case 'text':
        return okhttp3.RequestBody.create(mediaType, content.text);

      case 'json':
        return okhttp3.RequestBody.create(mediaType, JSON.stringify(content.value));

      case 'bytes':
        return okhttp3.RequestBody.create(mediaType, content.value);

      case 'file': {
        const file = new java.io.File(content.fileName);
        return okhttp3.RequestBody.create(mediaType, file);
      }

      case 'multipart': {
        const builder = new okhttp3.MultipartBody.Builder();
        for (const part of content.parts) {
          switch (part.type) {
            case 'form-value': {
              builder.addFormDataPart(part.name, part.value);
              break;
            }

            case 'form-file': {
              const body = createRequestBody(part.body);
              builder.addFormDataPart(part.name, part.fileName, body);
              break;
            }

            case 'part': {
              const body = createRequestBody(part.body);
              const headers = createRequestHeaders(part.headers);
              if (headers) {
                builder.addPart(headers, body);
              } else {
                builder.addPart(body);
              }
              break;
            }
          }
        }
        return builder.build();
      }
    }
  };

  const createOkRequest = (options: IHttpRequest): okhttp3.Request => {
    const url = urljoin(baseUrl, options.url) as string;
    const builder = new okhttp3.Request.Builder();

    builder.url(url);
    builder.headers(createRequestHeaders(options.headers));

    const body = createRequestBody(options.content);

    builder.method(options.method, body);

    return builder.build();
  };

  const createFromOkResponse = (resp: okhttp3.Response): IHttpResponse | HttpError => {
    const code = resp.code();
    const error = getResponseError(code);

    const headers = createResponseHeaders(resp.headers());

    const text = () => of(resp.body().string());
    const bytes = () => of(resp.body().bytes());
    const json = () => text().pipe(map((s) => JSON.parse(s)));
    const save = (fileName: string) =>
      new Observable<void>((o) => {
        const output = new java.io.FileOutputStream(fileName);
        const source = resp.body().source();
        const buffer: androidNative.Array<number> = Array.create('byte', 4096);
        while (true) {
          const count = source.read(buffer, 0, 4096);
          if (count <= 0) break;
          output.write(buffer, 0, count);
        }
        output.flush();
        output.close();
        o.next();
        o.complete();
        return;
      });

    const response: IHttpResponse = {
      statusCode: code,
      headers,
      text,
      json,
      bytes,
      save,
    };

    if (error) {
      error.response = response;
      return error;
    }

    return response;
  };

  return {
    request: (options: IHttpRequest): Observable<IHttpResponse> =>
      new Observable<IHttpResponse>((obs) => {
        const req = createOkRequest(options);

        const call = client().newCall(req);
        const closureR = {
          resp: null as okhttp3.Response,
        };

        log(`REQUEST: ${options.method}: ${options.url}`);
        log(() => printHeaders(options.headers));
        log(() => printContentSummary(options.content));

        call.enqueue(
          new okhttp3.Callback({
            onFailure(param, ex) {
              log(`Connectivity error with url '${options.url}': ${ex.getMessage()}`);
              obs.error(new TransientError('error.connectivity'));
            },
            onResponse(param, resp) {
              log(`RESPONSE TO: ${options.method}: ${options.url}`);
              // log(`STATUS: ${resp.code()}: ${resp.message()}`);

              closureR.resp = resp;
              const response = createFromOkResponse(resp);

              if (response instanceof Error) {
                log(() => `${response.name}: ${response.message}`);
                obs.error(response);
              } else {
                // log(() => printHeaders(response.headers)); // printHeaders throws
                obs.next(response);
                obs.complete();
              }
            },
          })
        );

        return () => {
          call.cancel();
          if (closureR.resp) {
            closureR.resp.close();
          }
        };
      }),
  };
};

export * from './common';
