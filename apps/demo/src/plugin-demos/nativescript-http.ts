import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptHttp } from '@demo/shared';
import {} from '@testjg/nativescript-http';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptHttp {}
