import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptGuidComponent } from './nativescript-guid.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptGuidComponent }])],
  declarations: [NativescriptGuidComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptGuidModule {}
