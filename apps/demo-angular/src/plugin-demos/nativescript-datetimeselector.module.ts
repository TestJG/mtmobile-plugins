import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptDatetimeselectorComponent } from './nativescript-datetimeselector.component';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule.forChild([
      { path: '', component: NativescriptDatetimeselectorComponent },
    ]),
  ],
  declarations: [NativescriptDatetimeselectorComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptDatetimeselectorModule {}
