const npsUtils = require('nps-utils');

module.exports = {
  message: 'NativeScript Plugins ~ made with ❤️  Choose a command to start...',
  pageSize: 32,
  scripts: {
    default: 'nps-i',
    nx: {
      script: 'nx',
      description: 'Execute any command with the @nrwl/cli',
    },
    format: {
      script: 'nx format:write',
      description: 'Format source code of the entire workspace (auto-run on precommit hook)',
    },
    '🔧': {
      script: `npx cowsay "NativeScript plugin demos make developers 😊"`,
      description: '_____________  Apps to demo plugins with  _____________',
    },
    // demos
    apps: {
      '...Vanilla...': {
        script: `npx cowsay "Nothing wrong with vanilla 🍦"`,
        description: ` 🔻 Vanilla`,
      },
      demo: {
        clean: {
          script: 'nx run demo:clean',
          description: '⚆  Clean  🧹',
        },
        ios: {
          script: 'nx run demo:ios',
          description: '⚆  Run iOS  ',
        },
        android: {
          script: 'nx run demo:android',
          description: '⚆  Run Android  🤖',
        },
      },
      '...Angular...': {
        script: `npx cowsay "Test all the Angles!"`,
        description: ` 🔻 Angular`,
      },
      'demo-angular': {
        clean: {
          script: 'nx run demo-angular:clean',
          description: '⚆  Clean  🧹',
        },
        ios: {
          script: 'nx run demo-angular:ios',
          description: '⚆  Run iOS  ',
        },
        android: {
          script: 'nx run demo-angular:android',
          description: '⚆  Run Android  🤖',
        },
      },
    },
    '⚙️': {
      script: `npx cowsay "@testjg/* packages will keep your ⚙️ cranking"`,
      description: '_____________  @testjg/*  _____________',
    },
    // packages
    // build output is always in dist/packages
    '@testjg': {
      // @testjg/nativescript-guid
      'nativescript-guid': {
        build: {
          script: 'nx run nativescript-guid:build.all',
          description: '@testjg/nativescript-guid: Build',
        },
      },
      // @testjg/nativescript-nfc
      'nativescript-nfc': {
        build: {
          script: 'nx run nativescript-nfc:build.all',
          description: '@testjg/nativescript-nfc: Build',
        },
      },
      // @testjg/nativescript-sqlite
      'nativescript-sqlite': {
        build: {
          script: 'nx run nativescript-sqlite:build.all',
          description: '@testjg/nativescript-sqlite: Build',
        },
      },
      // @testjg/nativescript-filepicker
      'nativescript-filepicker': {
        build: {
          script: 'nx run nativescript-filepicker:build.all',
          description: '@testjg/nativescript-filepicker: Build',
        },
      },
      // @testjg/nativescript-datetimeselector
      'nativescript-datetimeselector': {
        build: {
          script: 'nx run nativescript-datetimeselector:build.all',
          description: '@testjg/nativescript-datetimeselector: Build',
        },
      },
      // @testjg/nativescript-http
      'nativescript-http': {
        build: {
          script: 'nx run nativescript-http:build.all',
          description: '@testjg/nativescript-http: Build',
        },
      },
      'build-all': {
        script: 'nx run-many --target=build.all --all',
        description: 'Build all packages',
      },
    },
    '⚡': {
      script: `npx cowsay "Focus only on source you care about for efficiency ⚡"`,
      description: '_____________  Focus (VS Code supported)  _____________',
    },
    focus: {
      'nativescript-guid': {
        script: 'nx run nativescript-guid:focus',
        description: 'Focus on @testjg/nativescript-guid',
      },
      'nativescript-nfc': {
        script: 'nx run nativescript-nfc:focus',
        description: 'Focus on @testjg/nativescript-nfc',
      },
      'nativescript-sqlite': {
        script: 'nx run nativescript-sqlite:focus',
        description: 'Focus on @testjg/nativescript-sqlite',
      },
      'nativescript-filepicker': {
        script: 'nx run nativescript-filepicker:focus',
        description: 'Focus on @testjg/nativescript-filepicker',
      },
      'nativescript-datetimeselector': {
        script: 'nx run nativescript-datetimeselector:focus',
        description: 'Focus on @testjg/nativescript-datetimeselector',
      },
      'nativescript-http': {
        script: 'nx run nativescript-http:focus',
        description: 'Focus on @testjg/nativescript-http',
      },
      reset: {
        script: 'nx g @testjg/plugin-tools:focus-packages',
        description: 'Reset Focus',
      },
    },
    '.....................': {
      script: `npx cowsay "That's all for now folks ~"`,
      description: '.....................',
    },
  },
};
