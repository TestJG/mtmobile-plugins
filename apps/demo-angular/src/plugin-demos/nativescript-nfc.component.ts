import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptNfc } from '@demo/shared';
import { } from '@testjg/nativescript-nfc';

@Component({
	selector: 'demo-nativescript-nfc',
	templateUrl: 'nativescript-nfc.component.html',
})
export class NativescriptNfcComponent {
  
  demoShared: DemoSharedNativescriptNfc;
  
	constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptNfc();
  }

}