import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptNfcComponent } from './nativescript-nfc.component';

@NgModule({
	imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptNfcComponent }])],
  declarations: [NativescriptNfcComponent],
  schemas: [ NO_ERRORS_SCHEMA]
})
export class NativescriptNfcModule {}
