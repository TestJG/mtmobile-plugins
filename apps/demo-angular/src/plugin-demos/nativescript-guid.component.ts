import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptGuid } from '@demo/shared';
import { } from '@testjg/nativescript-guid';

@Component({
	selector: 'demo-nativescript-guid',
	templateUrl: 'nativescript-guid.component.html',
})
export class NativescriptGuidComponent {
  
  demoShared: DemoSharedNativescriptGuid;
  
	constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptGuid();
  }

}