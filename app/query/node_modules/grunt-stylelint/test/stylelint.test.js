'use strict';

const grunt = require( 'grunt' );

exports.stylelint = {
	outputFile: function ( test ) {
		const actual = grunt.file.read( 'tmp/outputFile/report.txt' );
		const expected = grunt.file.read( 'test/expected/outputFile/report.txt' );

		test.equal( actual, expected, 'Should report to file.' );
		test.done();
	}
};
