import { EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptNfc } from '@demo/shared';
import { NfcService } from '@testjg/nativescript-nfc';
import { NfcNdefData } from '@testjg/nativescript-nfc/interfaces';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptNfc {
  private nfcService: NfcService;
  isAvailable = 'unknown';
  isEnabled = 'unknown';
  isListening = false;
  lastDataRead: string;

  constructor() {
    super();
    this.nfcService = new NfcService();
  }

  async available() {
    const res = await this.nfcService.available();
    this.isAvailable = res ? 'NFC available' : 'NFC not available';
    this.notifyPropertyChange('isAvailable', this.isAvailable);
  }

  async enabled() {
    const res = await this.nfcService.enabled();
    this.isEnabled = res ? 'NFC enabled' : 'NFC not enabled';
    this.notifyPropertyChange('isEnabled', this.isEnabled);
  }

  async setListener() {
    await this.nfcService.setOnNdefDiscoveredListener(this.updateLastDataRead.bind(this), {
      scanHint: 'Scan it babe!',
      stopAfterFirstRead: true,
    });
    this.isListening = true;
    this.notifyPropertyChange('isListening', this.isListening);
  }

  updateLastDataRead(data: NfcNdefData) {
    this.lastDataRead = JSON.stringify(data);
    console.log('data', data);
    this.notifyPropertyChange('lastDataRead', this.lastDataRead);
  }

  async stopListening() {
    await this.nfcService.setOnNdefDiscoveredListener(null);
    this.isListening = false;
    this.notifyPropertyChange('isListening', this.isListening);
    this.lastDataRead = null;
    this.notifyPropertyChange('lastDataRead', this.lastDataRead);
  }
}
