import { DemoSharedBase } from '../utils';
import {
  showDateSelector,
  showDateTimeSelector,
  showTimeSelector,
} from '@testjg/nativescript-datetimeselector';

export class DemoSharedNativescriptDatetimeselector extends DemoSharedBase {
  showDateSelector() {
    this.safeAction(() => showDateSelector({ okText: 'ok', cancelText: 'cancel' }), true);
  }

  showDateTimeSelector() {
    this.safeAction(() => showDateTimeSelector({ okText: 'ok', cancelText: 'cancel' }), true);
  }

  showTimeSelector() {
    this.safeAction(() => showTimeSelector({ okText: 'ok', cancelText: 'cancel' }), true);
  }
}
