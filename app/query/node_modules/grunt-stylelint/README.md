[![NPM version](https://badge.fury.io/js/grunt-stylelint.svg)](http://badge.fury.io/js/grunt-stylelint)
[![Build Status](https://travis-ci.org/wikimedia/grunt-stylelint.svg?branch=master)](https://travis-ci.org/wikimedia/grunt-stylelint)
[![dependencies Status](https://david-dm.org/wikimedia/grunt-stylelint/status.svg)](https://david-dm.org/wikimedia/grunt-stylelint)
[![devDependencies Status](https://david-dm.org/wikimedia/grunt-stylelint/dev-status.svg)](https://david-dm.org/wikimedia/grunt-stylelint?type=dev)
[![NPM Downloads](https://img.shields.io/npm/dm/grunt-stylelint.svg)](https://www.npmjs.org/package/grunt-stylelint)

# grunt-stylelint
Grunt plugin for running [stylelint](http://stylelint.io/)

## Getting started

If this is the first time you're using [Grunt](http://gruntjs.com/), the [getting started guide](http://gruntjs.com/getting-started) will show you how to get up and running.

Once you have that installed, with a [Gruntfile](http://gruntjs.com/sample-gruntfile) set for your code, you can install the plugin with:

<pre lang=shell>
npm install grunt-stylelint stylelint --save-dev
</pre>

Note that this installs both grunt-stylelint and the stylelint tool itself, which is a peer dependency. If you do not explicitly depend on stylelint in your `package.json` file and do not have it available, grunt-stylelint will not work. Modern versions of npm will warn you of such unmet peer dependencies.

In your Gruntfile, add the line:

<pre lang=js>
grunt.loadNpmTasks( 'grunt-stylelint' );
</pre>

## Running and configuring `stylelint` task

_Run this task with the `grunt stylelint` command._

You can specify the targets and options for the task using the normal Grunt configuration – see Grunt's [guide on how to configure tasks](http://gruntjs.com/configuring-tasks) in general.

For more explanations of the lint errors stylelint will throw at you please visit http://stylelint.io/.

### Usage examples

#### Example simple config
In this example, running `grunt stylelint:all` (or `grunt stylelint` because `stylelint` is a [multi task](http://gruntjs.com/configuring-tasks#task-configuration-and-targets)) will lint the project's CSS and Sass files in the `css` and `sass` directories and their subdirectories, using the default stylelint options or the options specified in the `.stylelintrc` in the root of the project. For an example config see http://stylelint.io/user-guide/example-config/.

```js
// Project configuration.
grunt.initConfig({
  stylelint: {
    all: ['css/**/*.css', 'sass/**/*.scss']
  }
});
```

#### Example full config
A full set of config with default options would be:
```js
// Project configuration.
grunt.initConfig( {
  stylelint: {
    options: {
      configFile: '.stylelintrc',
      formatter: 'string',
      ignoreDisables: false,
      failOnError: true,
      outputFile: '',
      reportNeedlessDisables: false,
      fix: false,
      syntax: ''
    },
    src: [
            'src/**/*.{css,less,scss}',
            …,
            '!src/badstyles/*.css'
        ]
    }
}
```

### Options
The `options` object is passed through to `stylelint`. Options you may wish to set are:

#### formatter
Type: `function` or `string`
Default value: `"string"`
Values: `"string"`|`"verbose"`|`"json"`

In which output format would you like results. If `grunt` is run with `--verbose` and this is not explicitly set, it will act as though you passed in `"verbose"`.

#### ignoreDisables
Type: `boolean`
Default value: `false`

Whether to ignore inline comments that disable stylelint.

#### outputFile
Type: `string`

Output the report to a file.

#### reportNeedlessDisables
Type: `boolean`
Default value: `false`

Whether to ignore inline comments that disable stylelint and report which ones did not block a lint warning.

#### failOnError
Type: `boolean`
Default value: `true`

Whether to fail if stylelint detects an error.

#### fix
Type: `boolean`
Default value: `false`

Automatically fix, where possible, violations reported by rules. If `grunt` is run with `--fix` and this is not explicitly set, it will be set to `true`.

#### syntax
Type: `string`
Values: `"scss"`|`"less"`|`"sugarss"`

Which syntax standard should be used to parse source stylesheets. If this is unset, `stylelint` will attempt to guess which syntax is used by the files' extensions.
