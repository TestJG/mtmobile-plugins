import { Observable } from '@nativescript/core';

export class DemoSharedBase extends Observable {
  // in case you want to globally control how your shared demo code works across whole workspace

  async safeAction<T>(action: () => Promise<T>, log = false) {
    try {
      const result = await action();
      log && console.log(result);
      return result;
    } catch (error) {
      log && console.log(error);
    }
  }
}
