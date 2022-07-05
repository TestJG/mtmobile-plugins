import { Observable } from 'rxjs';
import urljoin from 'url-join';
import { Utils } from '@nativescript/core';

export interface RequestBodyBase {
  mediaType: string;
}

export interface FileRequestBody extends RequestBodyBase {
  type: 'file';
  fileName: string;
}

export const fileBody = (
  fileName: string,
  mediaType = 'application/octet-stream'
): FileRequestBody => ({
  type: 'file',
  fileName,
  mediaType,
});

export interface TextRequestBody extends RequestBodyBase {
  type: 'text';
  text: string;
}

export const textBody = (text: string, mediaType = 'text/plain'): TextRequestBody => ({
  type: 'text',
  text,
  mediaType,
});

export interface JsonRequestBody extends RequestBodyBase {
  type: 'json';
  value: any;
}

export const jsonBody = (value: any, mediaType = 'application/json'): JsonRequestBody => ({
  type: 'json',
  value,
  mediaType,
});

export interface BytesRequestBody extends RequestBodyBase {
  type: 'bytes';
  value: androidNative.Array<number>;
}

export const bytesBody = (
  value: androidNative.Array<number>,
  mediaType = 'application/octet-stream'
): BytesRequestBody => ({
  type: 'bytes',
  value,
  mediaType,
});

export type MultiPartMediaType =
  | 'multipart/alternative'
  | 'multipart/mixed'
  | 'multipart/digest'
  | 'multipart/parallel'
  | 'multipart/form-data';

export interface FormValuePart {
  type: 'form-value';
  name: string;
  value: string;
}

export const formValuePart = (name: string, value: string): FormValuePart => ({
  type: 'form-value',
  name,
  value,
});

export interface FormFilePart {
  type: 'form-file';
  name: string;
  fileName: string;
  body: RequestBody;
}

export const formFilePart = (name: string, fileName: string, body: RequestBody): FormFilePart => ({
  type: 'form-file',
  name,
  fileName,
  body,
});

export interface GenericPart {
  type: 'part';
  name: string;
  body: RequestBody;
  headers?: HttpRequestHeaders;
}

export const part = (
  name: string,
  body: RequestBody,
  headers?: HttpRequestHeaders
): GenericPart => ({
  type: 'part',
  name,
  body,
  headers,
});

export type MultiPartRequestPart = FormValuePart | FormFilePart | GenericPart;

export interface MultiPartRequestBody extends RequestBodyBase {
  type: 'multipart';
  mediaType: MultiPartMediaType;
  parts: MultiPartRequestPart[];
}

export const multiPartBody = (
  parts: MultiPartRequestPart[],
  mediaType: MultiPartMediaType = 'multipart/form-data'
): MultiPartRequestBody => ({
  type: 'multipart',
  parts,
  mediaType,
});

export type RequestBody =
  | FileRequestBody
  | TextRequestBody
  | JsonRequestBody
  | BytesRequestBody
  | MultiPartRequestBody;

export type HttpRequestMethod = 'GET' | 'POST';
export type HttpRequestHeaderValue = string | string[];
export interface HttpRequestDictionaryHeaders {
  [header: string]: HttpRequestHeaderValue;
}
// export type HttpRequestArrayHeaders = (string | [string, HttpRequestHeaderValue])[];
// export type HttpRequestHeaders = HttpRequestDictionaryHeaders | HttpRequestArrayHeaders;
export type HttpRequestHeaders = HttpRequestDictionaryHeaders;
export interface HttpResponseHeaders {
  [header: string]: string[];
}

export const loopHeaders = (
  headers: HttpRequestHeaders,
  callback: (headerName: string, headerValue: string) => void
) => {
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      callback(key, value);
    } else {
      for (const val of value) {
        callback(key, val);
      }
    }
  }
};

export const printHeaders = (headers: HttpRequestHeaders, indentation: string = ''): string => {
  if (Utils.isNullOrUndefined(headers)) return 'NO HEADERS';

  let result = '';
  const append = (line: string) => {
    if (result.length > 0) result += '\n';
    result += indentation;
    result += line;
  };

  loopHeaders(headers, (name, value) => append(`${name}: ${value.slice(0, 60)}`));

  return result || 'NO HEADERS';
};

export const printContentSummary = (body: RequestBody): string => {
  if (Utils.isNullOrUndefined(body)) return 'NO BODY';

  let result = '';
  let indentation = '';
  const append = (line: string) => {
    if (result.length > 0) result += '\n';
    result += indentation;
    result += line;
  };
  const indent = () => (indentation += '    ');
  const unIndent = () => (indentation = indentation.substring(0, indentation.length - 4));

  const loopPart = (p: MultiPartRequestPart) => {
    switch (p.type) {
      case 'form-value':
        append(`FORM-VALUE: ${p.name} = ${p.value.slice(0, 60)}`);
        break;

      case 'form-file':
        append(`FORM-FILE: ${p.name} [${p.fileName}] with body:`);
        indent();
        loop(p.body);
        unIndent();
        break;

      case 'part':
        append(`PART: `);
        indent();
        printHeaders(p.headers, indentation);
        loop(p.body);
        unIndent();
        break;
    }
  };

  const loop = (b: RequestBody) => {
    switch (b.type) {
      case 'bytes':
        append(`BYTES: ${b.mediaType} with ${b.value.length} bytes`);
        break;

      case 'text':
        append(`TEXT: ${b.mediaType} "${b.text.slice(0, 60)}" [${b.text.length} chars]`);
        break;

      case 'file':
        append(`FILE: ${b.mediaType} from ${b.fileName}`);
        break;

      case 'json': {
        const text = JSON.stringify(b.value);
        append(`JSON: ${text.slice(0, 60)} [${text.length} chars]`);
        break;
      }

      case 'multipart':
        append(`MULTIPART: ${b.mediaType} with ${b.parts.length} parts`);
        indent();
        for (const p of b.parts) {
          loopPart(p);
        }
        unIndent();
        break;

      default:
        break;
    }
  };

  loop(body);

  return result || 'NO BODY';
};

export interface IHttpRequest {
  url: string;
  method: HttpRequestMethod;
  headers?: HttpRequestHeaders;
  content?: RequestBody;
}

export interface IHttpResponse {
  statusCode: number;
  headers: HttpResponseHeaders;
  text(): Observable<string>;
  json<T>(): Observable<T>;
  bytes(): Observable<androidNative.Array<number>>;
  save(fileName: string): Observable<void>;
}

export interface IHttp {
  request(options: IHttpRequest): Observable<IHttpResponse>;
}

type Logger = (...args: (string | (() => string))[]) => void;

export type CreateHttp = (baseUrl: string, log?: Logger) => IHttp;

export const NOOP = () => {
  // No operation
};

export const getLogger = (log: Logger | undefined) => log ?? NOOP;

export function forRelativeUrl(relativeUrl: string, http: IHttp): IHttp {
  const request = (options: IHttpRequest): Observable<IHttpResponse> => {
    const newUrl = urljoin(relativeUrl, options.url);
    const newRequest = { ...options, url: newUrl };
    return http.request(newRequest);
  };

  return { request };
}

export class HttpError extends Error {
  response?: IHttpResponse;
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TransientError extends HttpError {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export const getResponseError = (statusCode: number): TransientError | HttpError | null => {
  if (statusCode >= 500) {
    // It is a server error, so it can be transient. A retry can fix it
    return new TransientError(`error.server`);
  } else if (statusCode >= 400) {
    // It is a client error, so retrying wont fix the problem.
    return new HttpError(`error.client.${statusCode}`);
  } else if (statusCode >= 300 || statusCode < 200) {
    // It is an unexpected protocol behavior, so retrying wont fix the problem.
    return new HttpError(`error.protocol`);
  }
  return null;
};
