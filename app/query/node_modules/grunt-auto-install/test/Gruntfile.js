'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    auto_install: {
      subdir: {
        options: {
          cwd: './subdir',
          npm: ''
        },
        data: 'stuff'
      },
      local: {
        options: {
          npm: false,
          bower: '--production'
        }
      },
      recursive: {
        options: {
          cwd: './subdir',
          npm: '',
          recursive: true,
          match: '.*match.*',
          exclude: '.*exclude.*'
        }
      }
    }
  });

  grunt.loadTasks('../tasks');
};
