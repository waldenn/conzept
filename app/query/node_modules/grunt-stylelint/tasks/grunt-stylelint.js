/*!
 * Run CSS files through stylelint and complain
 */

'use strict';

const chalk = require( 'chalk' );

module.exports = function ( grunt ) {

	function pluralize( word, count ) {
		return ( count === 1 ? word : word + 's' );
	}

	function output( outputFile, report, func ) {
		if ( outputFile ) {
			grunt.file.write( outputFile, report );
			grunt.log.writeln( 'Report written to ' + outputFile );
		} else {
			func( report );
		}
	}

	grunt.registerMultiTask( 'stylelint', function () {
		const options = this.options(),
			done = this.async(),
			styleLint = require( 'stylelint' ),
			verbose = !!grunt.option( 'verbose' ),
			fix = !!grunt.option( 'fix' );

		options.failOnError = options.failOnError !== undefined ? options.failOnError : true;

		options.fix = options.fix !== undefined ? options.fix : fix;

		options.files = this.filesSrc.filter( function ( file ) {
			return grunt.file.isFile( file );
		} );

		options.formatter = options.formatter || ( verbose ? 'verbose' : 'string' );

		// Explicitly allow no files, as otherwise stylelint itself throws an error.
		options.allowEmptyInput = true;

		styleLint.lint( options ).then( function ( data ) {
			if ( data.output ) {
				if ( verbose ) {
					output( options.outputFile, data.output, grunt.log.write );
				} else if ( data.errored ) {
					output( options.outputFile, data.output, grunt.log.write );
				} else {
					output( options.outputFile, data.output, grunt.log.ok );
				}
			}

			const warningsCount = data.results.reduce( function ( count, item ) {
				return count + item.warnings.length;
			}, 0 );

			if ( warningsCount ) {
				grunt.log.writeln();
				grunt.log.writeln( chalk.yellow.bold( [
					'⚠ ', warningsCount, pluralize( ' warning', warningsCount ), '\n'
				].join( '' ) ) );
			}

			if ( data.errored ) {
				done( !options.failOnError );
			} else {
				grunt.log.ok( 'Linted ' + options.files.length + ' files without errors' );
				done();
			}
		}, function ( err ) {
			grunt.fail.warn( 'Running stylelint failed\n' + err.stack.toString() );

			done( false );
		} );
	} );

};
