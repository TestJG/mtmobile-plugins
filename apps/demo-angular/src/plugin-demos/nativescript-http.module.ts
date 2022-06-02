import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptHttpComponent } from './nativescript-http.component';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule.forChild([{ path: '', component: NativescriptHttpComponent }]),
  ],
  declarations: [NativescriptHttpComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptHttpModule {}
