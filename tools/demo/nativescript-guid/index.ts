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

  withEmptySeparator() {
    this._guid = createGuid('');
    console.assert(typeof this._guid === 'string');
    console.assert(!this._guid.includes('-'));
    this.notifyPropertyChange('guid', this._guid);
  }

  withSlashSeparator() {
    const separator = '/';
    this._guid = createGuid(separator);
    console.assert(typeof this._guid === 'string');
    console.assert(this._guid.includes(separator));
    this.notifyPropertyChange('guid', this._guid);
  }
}
