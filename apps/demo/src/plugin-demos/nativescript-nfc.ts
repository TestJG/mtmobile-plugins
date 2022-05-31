import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptNfc } from '@demo/shared';
import { } from '@testjg/nativescript-nfc';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptNfc {
	
}
