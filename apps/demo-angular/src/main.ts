import { runNativeScriptAngularApp, platformNativeScript } from '@nativescript/angular';
import { CoreTypes, TouchManager } from '@nativescript/core';
import { AppModule } from './app.module';

TouchManager.enableGlobalTapAnimations = true;
TouchManager.animations = {
  down: {
    scale: { x: 0.95, y: 0.95 },
    duration: 200,
    curve: CoreTypes.AnimationCurve.easeInOut,
  },
  up: {
    scale: { x: 1, y: 1 },
    duration: 200,
    curve: CoreTypes.AnimationCurve.easeInOut,
  },
};

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
