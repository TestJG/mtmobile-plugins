import { Component } from '@angular/core';

@Component({
  selector: 'demo-home',
  templateUrl: 'home.component.html',
})
export class HomeComponent {
  demos = [
    {
      name: 'nativescript-datetimeselector',
    },
    {
      name: 'nativescript-filepicker',
    },
    {
      name: 'nativescript-guid',
    },
    {
      name: 'nativescript-http',
    },
    {
      name: 'nativescript-nfc',
    },
    {
      name: 'nativescript-sqlite',
    },
  ];
}
