import { DemoSharedBase } from '../utils';
import { createGuid } from '@testjg/nativescript-guid';

export class DemoSharedNativescriptGuid extends DemoSharedBase {
  private _guid: string = '';

  get guid() {
    return this._guid;
  }

  testIt() {
    this._guid = createGuid();
    console.assert(typeof this._guid === 'string');
    this.notifyPropertyChange('guid', this._guid);
  }
}
