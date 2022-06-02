import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptFilepicker } from '@demo/shared';
import {} from '@testjg/nativescript-filepicker';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptFilepicker {}
