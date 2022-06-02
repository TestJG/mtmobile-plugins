import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptDatetimeselector } from '@demo/shared';

@Component({
  selector: 'demo-nativescript-datetimeselector',
  templateUrl: 'nativescript-datetimeselector.component.html',
})
export class NativescriptDatetimeselectorComponent {
  demoShared: DemoSharedNativescriptDatetimeselector;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptDatetimeselector();
  }
}
