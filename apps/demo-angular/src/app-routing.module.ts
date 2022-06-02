import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'nativescript-datetimeselector',
    loadChildren: () =>
      import('./plugin-demos/nativescript-datetimeselector.module').then(
        (m) => m.NativescriptDatetimeselectorModule
      ),
  },
  {
    path: 'nativescript-filepicker',
    loadChildren: () =>
      import('./plugin-demos/nativescript-filepicker.module').then(
        (m) => m.NativescriptFilepickerModule
      ),
  },
  {
    path: 'nativescript-guid',
    loadChildren: () =>
      import('./plugin-demos/nativescript-guid.module').then((m) => m.NativescriptGuidModule),
  },
  {
    path: 'nativescript-nfc',
    loadChildren: () =>
      import('./plugin-demos/nativescript-nfc.module').then((m) => m.NativescriptNfcModule),
  },
  {
    path: 'nativescript-sqlite',
    loadChildren: () =>
      import('./plugin-demos/nativescript-sqlite.module').then((m) => m.NativescriptSqliteModule),
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
