/*
 * grunt-auto-install
 *
 * https://github.com/Manabu-GT/grunt-auto-install
 *
 * Copyright (c) 2013 Manabu Shimobe
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Libs
  var async = require('async');

  var exec = require('child_process').exec;
  var path = require('path');
  var fs = require('fs');

  grunt.registerMultiTask('auto_install', 'Install and update npm & bower dependencies.', function() {

    var done = this.async();

    var TASKS = [
      {
        name: 'npm',
        cmd: 'npm install',
        package_meta_data: 'package.json'
      },
      {
        name: 'bower',
        cmd: 'bower install',
        package_meta_data: 'bower.json'
      }
    ];

    // Merge task-specific options with these defaults.
    var options = this.options({
      cwd: process.cwd(),
      stdout: true,
      stderr: true,
      failOnError: true,
      npm: true,
      bower: true,
      recursive: false,
      match: '.*', // Always true
      exclude: '/(?=a)b/' // Always false
    });

    var cwd = path.resolve(process.cwd(), options.cwd);

    /**
     * Synchronously walks the directory
     * and returns an array of every subdirectory that
     * matches the patterns, and doesn't match any exclude pattern
     **/
    var walk = function(dir) {
      var results = [];

      var list = fs.readdirSync(dir);

      list.forEach(function(file) {
        // Check for every given pattern, regardless of whether it is an array or a string
        var matchesSomeExclude = [].concat(options.exclude).some(function(regexp) {
          return file.match(regexp) != null;
        });

        if(!matchesSomeExclude) {
          var matchesSomePattern = [].concat(options.match).some(function(regexp) {
            return file.match(regexp) != null;
          });

          file = path.resolve(dir, file);
          var stat = fs.statSync(file);

          if (stat && stat.isDirectory()) {
            if(matchesSomePattern) {
              results = results.concat(file);
            }
            results = results.concat(walk(file));
          }
        }
      });

      return results;
    };

    var runCmd = function(file, item, callback) {
      grunt.log.write('running ' + item + ' on ' + file + '...');
      var cmd = exec(item, {cwd: file, maxBuffer: Infinity}, function(error, stdout, stderr) {
        if (error) {
          grunt.log.writeln('\x1b[31mx\x1b[0m');
          callback(error);
          return;
        }
        grunt.log.writeln('\x1b[32m✔\x1b[0m');
        callback();
      });

      if (options.stdout || grunt.option('verbose')) {
        cmd.stdout.pipe(process.stdout);
      }
      if (options.stderr || grunt.option('verbose')) {
        cmd.stderr.pipe(process.stderr);
      }
    };

    var asyncTask = function(file, taskCmd) {
      return function(callback) {
        runCmd(file, taskCmd, callback);
      };
    };

    var installTasks = [];

    TASKS.forEach(function(task) {
      var dirs = [options.cwd];

      if(options.recursive) {
        dirs = dirs.concat(walk(options.cwd));
      }

      dirs.forEach(function(dir) {
        var file = path.join(dir, task.package_meta_data);

        if (grunt.file.exists(file) && (options[task.name] === true || typeof options[task.name] === 'string')) {
          var taskCmd = (typeof options[task.name] === 'string') ? task.cmd + ' ' + options[task.name]: task.cmd;
          installTasks.push(asyncTask(dir, taskCmd));
        }
      });
    });

    async.series(installTasks,
      function(error, results) {
        if(error && options.failOnError) {
          grunt.warn(error);
        }
        done();
      }
    );

  });
};