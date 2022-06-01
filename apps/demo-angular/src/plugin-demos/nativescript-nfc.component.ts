import { Component, NgZone } from '@angular/core';
import { isAndroid } from '@nativescript/core';
import { NgNfcService } from '@testjg/nativescript-nfc/angular';
import type { NfcNdefData } from '@testjg/nativescript-nfc/interfaces';

@Component({
  selector: 'demo-nativescript-nfc',
  templateUrl: 'nativescript-nfc.component.html',
})
export class NativescriptNfcComponent {
  isAvailable: boolean;
  isEnabled: boolean;
  isListening: boolean;
  lastDataRead: string;

  constructor(private _ngZone: NgZone, private nfcService: NgNfcService) {}

  async available() {
    this.isAvailable = await this.nfcService.available();
  }

  async enabled() {
    this.isEnabled = await this.nfcService.enabled();
  }

  async setListener() {
    await this.nfcService.setOnNdefDiscoveredListener(this.updateLastDataRead.bind(this), {
      scanHint: 'Scan it babe!',
      stopAfterFirstRead: true,
    });
    this.isListening = true;
  }

  updateLastDataRead(data: NfcNdefData) {
    this._ngZone.run(() => {
      this.lastDataRead = JSON.stringify(data);
      this.isListening = isAndroid;
    });
  }

  async stopListening() {
    await this.nfcService.setOnNdefDiscoveredListener(null);
    this.isListening = false;
    this.lastDataRead = null;
  }
}
