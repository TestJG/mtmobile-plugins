import { createHttp, jsonBody } from '@testjg/nativescript-http';
import { switchMap } from 'rxjs/operators';
import { DemoSharedBase } from '../utils';

export class DemoSharedNativescriptHttp extends DemoSharedBase {
  http = createHttp('https://jsonplaceholder.typicode.com');
  maxTodos = 200;

  testIt() {
    this.safeAction(() => {
      const id = Math.floor(Math.random() * this.maxTodos) + 1;
      return this.http
        .request({
          method: 'GET',
          url: `todos/${id}`,
          headers: { 'Accept-Language': ['ca', 'en'] },
        })
        .pipe(switchMap((res) => res.json<Todo[]>()));
    }, true);
  }

  postIt() {
    this.safeAction(() => {
      return this.http
        .request({
          method: 'POST',
          url: `todos`,
          content: jsonBody<Omit<Todo, 'id'>>({
            title: 'new_title',
            completed: false,
            userId: 1,
          }),
        })
        .pipe(switchMap((r) => r.json<Todo>()));
    }, true);
  }
}

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};
