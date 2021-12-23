# grunt-auto-install [![Build Status](https://travis-ci.org/Manabu-GT/grunt-auto-install.png?branch=master)](https://travis-ci.org/Manabu-GT/grunt-auto-install)

> Install and update npm and bower dependencies.
> It looks for 'package.json' and 'bower.json' files, and runs 'npm install' and 'bower install' respectively only if they exist.
> (You can also explicitly disable npm/bower tasks even if those files exist.)

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-auto-install --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-auto-install');
```

## The "auto_install" task

### Overview
In your project's Gruntfile, add a section named `auto_install` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  auto_install: {
    local: {},
    subdir: {
      options: {
        cwd: 'subdir',
        stdout: true,
        stderr: true,
        failOnError: true,
        npm: '--production'
      }
    }
  },
});
```

### Options

#### cwd
Type: `String`
Default value: `''` - runs in current directory

The working directory to run 'npm install' and 'bower install'. (relative path)

#### stdout
Type: `Boolean`
Default value: `true`

Shows stdout in the terminal.

#### stderr
Type: `Boolean`
Default value: `true`

Shows stderr in the terminal.

#### failOnError
Type: `Boolean`
Default value: `true`

Instructs the auto-install task to fail the grunt run if an error occurs during the task execution.

#### npm
Type: `Boolean` `String`
Default value: `true`

Set to `false` to turn off `npm install` so that it will not run even if there is a `package.json` file present.
If a `String` is specified, it is passed as an install option flags to `npm install`.
For example, `--production` flag could be used not to install modules listed in devDependencies.

#### bower
Type: `Boolean` `String`
Default value: `true`

Set to `false` to turn off `bower install` so that it will not run even if there is a `bower.json` file present.
If a `String` is specified, it is passed as an install option flags to `bower install`.
For example, `--production` flag could be used not to install modules listed in devDependencies and
`--allow-root` flag could be used so all is done using a root user.

#### recursive
Type: `Boolean`
Default value: `false`

Set to `true` to turn on the recursive installation.
Will walk the entire directory tree and install dependencies for any package contained in a subdirectory

#### match
Type: `String` `[String]`
Default value: `'.*'`

When recursive is set to `true`, will perform the installation only on the directories that match a regular expression, or one in an array of regular expressions.

#### exclude
Type: `String` `[String]`
Default value: `'/(?=a)b/'`

When recursive is set to `true`, will ignore the directories (and it's sub directories) that match with a regular expression, or one in an array of regular expressions.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  auto_install: {
    local: {}
  },
});
```

#### Custom Options

```js
grunt.initConfig({
  auto_install: {
    subdir: {
      options: {
        cwd: 'subdir',
        stderr: false,
        failOnError: false,
        npm: false,
        bower: '--allow-root'
      }
    }
  },
});
```

#### Recursive Option
You will most likely not use the `match` option

```js
auto_install: {
  grunt.initConfig({
    local: {},
    options: {
      recursive: true,
      exclude: ['.git', 'node_modules', 'bower_components']
    }
  }
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2016-05-20   v0.3.1   Update peerDependencies to support Grunt 1.0
 * 2015-10-11   v0.3.0   Added recursive options
 * 2015-06-09   v0.2.4   Disabled maxBuffer to avoid the maxBuffer exceeded error
 * 2014-12-18   v0.2.3   Added npm and bower options, and removed production option
 * 2014-10-25   v0.2.2   Added production option
 * 2014-02-27   v0.2.0   Converted to MultiTask
 * 2013-12-09   v0.1.1   Updated package.json
 * 2013-12-07   v0.1.0   Initial Release
