import { DemoSharedBase } from '../utils';
import { showFilePicker } from '@testjg/nativescript-filepicker';

export class DemoSharedNativescriptFilepicker extends DemoSharedBase {
  async showPicker() {
    await this.safeAction(showFilePicker, true);
  }

  async showPickerWithOptions() {
    await this.safeAction(() => showFilePicker({ chooserTitle: 'This is my custom title' }), true);
  }
}
