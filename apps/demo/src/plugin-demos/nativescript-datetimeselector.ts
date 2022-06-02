import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptDatetimeselector } from '@demo/shared';
import {} from '@testjg/nativescript-datetimeselector';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptDatetimeselector {}
