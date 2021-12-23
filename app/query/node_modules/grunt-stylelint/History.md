# grunt-stylelint Release History

## v0.16.0 / 2020-11-19
* Drop Node 8 support (Ed Sanders)
* Require stylelint 13.8.0, up from 13.3.2 (Ed Sanders, James D. Forrester)
* Upgrade chalk dependency from ^3.0.0 to ^4.1.0 (Ed Sanders)
* Pass through --fix to stylelint options (Ed Sanders)
* README: Fix label of 'fix' option, copy-pasted as 'syntax' (i alarmed alien)

## v0.15.0 / 2020-04-15
* Require stylelint 13.3.2, up from 13.2.0 (James D. Forrester)
* Upgrade chalk dependency from ^2.4.2 to ^3.0.0 (James D. Forrester)
* build: Replace Travis with GitHub Actions (James D. Forrester)
* build: Bump devDependencies to latest (James D. Forrester)

## v0.14.0 / 2020-02-14
* Require stylelint 13.2.0, up from 12.0.0 (James D. Forrester)
* build: Upgrade grunt-contrib-nodeunit from 2.0.0 to 2.1.0 for security issue (James D. Forrester)

## v0.13.0 / 2019-09-11
* Bump stylelint dependency from ^11.0.0 to ^12.0.0 (Lars Laade)
* build: Replace handlebars in sub-dependencies for npm audit's happiness (James D. Forrester)

## v0.12.0 / 2019-10-21
* Bump stylelint dependency from ^10.0.0 to ^11.0.0 (Nathan Woltman)
* build: Upgrade eslint-config-wikimedia from 0.13.1 to 0.14.3 (James D. Forrester)

## v0.11.1 / 2019-07-31
* Don't break but short-circuit when no files are passed in (James D. Forrester)

## v0.11.0 / 2019-04-30
* Bump stylelint dependency from ^9.0.0 to ^10.0.0 (Nathan Woltman)
* build: Update chalk dependency to the latest version (Nathan Woltman)
* build: Upgrade grunt from 1.0.3 to 1.0.4 (James D. Forrester)
* build: Upgrade eslint-config-wikimedia from 0.7.2 to 0.11.0 (James D. Forrester)
* build: Upgrade lodash from 4.17.10 to 4.17.11 (James D. Forrester)

## v0.10.1 / 2018-09-04
* Use correct stylelint option name (Stephen Edgar)
* Add `package-lock.json` to `.gitignore` (Stephen Edgar)
* Drop testing in Node 4, EOL today (James D. Forrester)
* build: Remove redundant 'npm@latest' for Travis (Timo Tijhof)
* build: Add Node 10 to Travis matrix (Timo Tijhof)
* build: Bump devDependencies to latest (James D. Forrester)

## v0.10.0 / 2018-04-04
* Bump stylelint dependency from ^8.0.0 to ^9.0.0 (Nathan Woltman)
* build: Bump various devDependencies to latest (James D. Forrester)
* build: Force lodash (dependency of table) to older version (Fixes #49) (James D. Forrester)

## v0.9.0 / 2017-08-04
* Travis CI: Use the latest npm 5.x, add Node.js 8.x (Stephen Edgar)
* README: Explicitly call out stylelint peerDep (James D. Forrester)
* build: Bump stylelint dependency from &7.8.0 to ^8.0.0 (axten)

## v0.8.0 / 2017-04-24
* build: Move stylelint to peer dependencies and upgrade it to the latest version. (Negar Naghshbandi)
* build: Change stylelint peerDependency to ^7.8.0 (James D. Forrester)

## v0.7.0 / 2017-02-17
* Don't over-ride `formatter` option if set (James D. Forrester)
* Support for `outputFile` and custom `formatter`s (Martin Cermak)
* README: Added basic configuration (M.D. van Es)
* README: Add `failOnError`; give full config example (James D. Forrester)
* tests: Test for `outputFile` (Martin Cermak)
* build: Replace jshint/jscs with eslint (Ed Sanders)
* build: Bump stylelint dependency from ^7.7.1 to 7.8.0 (James D. Forrester)

## v0.6.0 / 2016-07-29
* Travis CI: Cache NPM modules (Stephen Edgar)
* Travis CI: Test on latest Node.js v4.x.x and v6.x.x branches (Stephen Edgar)
* Bump stylelint ^6.8.0 -> ^7.0.0 (Stephen Edgar)

## v0.5.0 / 2016-07-01
* Bump stylelint 6.5.1 -> ^6.8.0 (Radu Micu)

## v0.4.0 / 2016-06-07
* Use default string formatter for output (Ed Sanders)
* Use built-in verbose formatter (Ed Sanders)
* Bump stylelint 6.3.3 -> 6.5.1 (Ed Sanders)

## v0.3.0 / 2016-05-19
* Update package.json fixing typo (Volker E)
* Fix error reporting (Ed Sanders)
* Provide a first unit test (James D. Forrester)
* Filter out directories passed in as input (James D. Forrester)

## v0.2.0 / 2016-05-17
* Allow user to specify all the options (Ed Sanders)
* Add History file (James D. Forrester)
* build: Enable testing via travis-CI (James D. Forrester)

## v0.1.0 / 2016-05-17
* Initial release (James D. Forrester)
