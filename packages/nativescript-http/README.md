# @testjg/nativescript-http

[![npm version](https://badge.fury.io/js/@testjg%2Fnativescript-http.svg)](https://badge.fury.io/js/@testjg%2Fnativescript-http)

Http helper lib. Under the hood it uses `okhttp` (v3) for Android and `NSURLSession` for iOS.

Has peer dependencies on [url-join](https://github.com/jfromaniello/url-join/) and [rxjs](https://github.com/ReactiveX/rxjs).

## Installation

```javascript
ns plugin add @testjg/nativescript-http
```

## Usage

```typescript
import { createHttp, forRelativeUrl } from '@testjg/nativescript-http';
import { firstValueFrom } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export class TodosService {
  http = createHttp('https://jsonplaceholder.typicode.com');
  todos = forRelativeUrl('todos', this.http);

  fetchTodo(id: number) {
    const json$ = this.todos
      .request({
        method: 'GET',
        url: `${id}`,
        headers: { 'Accept-Language': ['ca', 'en'] },
      })
      .pipe(
        switchMap((res) => res.json()),
        catchError((error) => null)
      );

    return firstValueFrom(json$);
  }
}
```

**Pro tip**: Use functions like `jsonBody` or `multiPartBody` to create the appropiate request content.

## License

Apache License Version 2.0
