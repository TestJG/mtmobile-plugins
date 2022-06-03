import { createHttp } from '@testjg/nativescript-http';
import { firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DemoSharedBase } from '../utils';

export class DemoSharedNativescriptHttp extends DemoSharedBase {
  http = createHttp('https://jsonplaceholder.typicode.com');
  maxTodos = 200;

  testIt() {
    this.safeAction(async () => {
      const id = Math.floor(Math.random() * this.maxTodos) + 1;
      const json$ = this.http
        .request({
          method: 'GET',
          url: `todos/${id}`,
          headers: { 'Accept-Language': ['ca', 'en'] },
        })
        .pipe(switchMap((res) => res.json()));

      return firstValueFrom(json$);
    }, true);
  }
}
