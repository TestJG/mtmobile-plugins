import { Observable } from '@nativescript/core';
import { firstValueFrom, Observable as RxObservable } from 'rxjs';

export class DemoSharedBase extends Observable {
  // in case you want to globally control how your shared demo code works across whole workspace

  async safeAction<T>(action: () => Promise<T> | RxObservable<T>, log = false) {
    try {
      const promOrObs = action();
      const result = await (promOrObs instanceof RxObservable
        ? firstValueFrom(promOrObs)
        : promOrObs);
      log && console.log(result);
      return result;
    } catch (error) {
      log && console.log(error);
    }
  }
}
