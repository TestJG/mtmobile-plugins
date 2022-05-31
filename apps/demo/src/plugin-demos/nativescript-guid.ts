import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptGuid } from '@demo/shared';
import { } from '@testjg/nativescript-guid';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptGuid {
	
}
