var path = require('path');

module.exports = function (grunt) {

    grunt.registerMultiTask("merge-i18n", "Merge your json i18n files", function () {
        /*  prepare options  */
        var options = this.options({
            separator: null,
        });

        var getLanguage = function(filename) {
            var name = path.basename(filename, '.json');
            var sep;

            // bypass separate lang name if the value is false
            if (!options.separator) {
              return name;
            }

            sep = name.lastIndexOf(options.separator);

            if (sep != -1) {
                name = name.substring(sep + 1);
            }
            return name;
        };

        var checkCurrentFiles = function(gFiles) {
            var files = {};

            gFiles.forEach(function (f) {
                var nfiles = grunt.file.expand({}, f.dest + '/*.json');
                grunt.util._.extend(files, nfiles);
            });

            return files;
        };

        var currentFiles = checkCurrentFiles(this.files);

        var analyseFiles = function(files, dest) {
            var languages = {};

            files.forEach(function (src) {
                if (!grunt.file.exists(src))
                    throw "JSON source file " + src + " not found";
                else {
                    var json;
                    try {
                        json = grunt.file.readJSON(src);
                    }
                    catch (e) {
                        throw "Unbale to read " + src;
                    }
                    var lang = getLanguage(src);
                    if (!languages[lang])
                        languages[lang] = {};
                    grunt.util._.extend(languages[lang], json);
                }
            });
            // Writing i18n Files
            for (language in languages) {
                var content = languages[language];
                var filePath = path.join(dest, language + '.json');

                if (grunt.file.exists(filePath) && !currentFiles[filePath]) {
                    var content2 = grunt.file.readJSON(filePath);
                    grunt.util._.extend(content, content2);
                }
                grunt.file.write(filePath, JSON.stringify(content));
                grunt.log.writeln("File " + filePath + " created");
            };
        };

        this.files.forEach(function (f) {
            try {
                analyseFiles(f.src, f.dest);
            } catch(e) {
                grunt.fail.warn(e);
            }
        });
    });
};
