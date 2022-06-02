import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptHttp } from '@demo/shared';
import {} from '@testjg/nativescript-http';

@Component({
  selector: 'demo-nativescript-http',
  templateUrl: 'nativescript-http.component.html',
})
export class NativescriptHttpComponent {
  demoShared: DemoSharedNativescriptHttp;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptHttp();
  }
}
