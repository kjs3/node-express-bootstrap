# Stripped-down Node/Express/Gulp app to quickly get up and running

### Using this to start a new project

##### Do a shallow clone of this repo

```
git clone --depth=1 git@github.com:kjs3/node-express-bootstrap.git
```

##### Remove the .git directory so it's not a repo anymore

```
cd node-express-bootstrap
rm -rf .git
```

##### Reinitialize a git repo to something else

```
git init
```

Remove `node_modules` and `bower_components` from `.gitignore` if you want to track those.

… and you're on you're way.

### Getting up and running

```
npm install -g gulp bower
npm install
bower install
gulp
```

### Start development server with live-reload

```
gulp watch
```
This starts a live-reload server that *should* automatically reload the page on css/js changes.

### start production server

```
npm start
```

### Notes

Gulpfile has `cache-bust` task that takes scss and js files from the assets directory, processes them (adding a fingerprint), and puts the result in the public directory.

The Express route uses a library to get those fingerprinted filenames from ./cache-bust.json and store them in `jsSrc` and `cssSrc` variables.
These vars are then used in the Jade template link tags to link to the fingerprinted file.

This process happens automatically with the `gulp watch` task.

### Running on Heroku?

A Gulp task and Procfile are included for deploying/running on Heroku.

Add the following config vars to your app

```
BUILDPACK_URL=https://github.com/timdp/heroku-buildpack-nodejs-gulp.git
NODE_ENV=production
npm_config_production=false
```

When you push to Heroku the 'heroku:production' Gulp task will be run which in turn just runs the 'cache-bust' task that fingerprints css/js files.

