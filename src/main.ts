  System.import('./loader/loader.js')
    .then(() => Promise.all([System.import('./app/app.module'), System.import('@angular/platform-browser-dynamic')]))
    .then(([app, platform]) => platform.platformBrowserDynamic().bootstrapModule(app.AppModule));
