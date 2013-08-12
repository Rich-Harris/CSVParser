module.exports = function ( grunt ) {

	'use strict';

	grunt.initConfig({

		pkg: grunt.file.readJSON( 'package.json' ),

		copy: {
			build: {
				src: 'src/CSVParser.js',
				dest: 'build/CSVParser.js',
				options: {
					processContent: function ( content ) {
						return content.replace( '<%= version %>', grunt.template.process( '<%= pkg.version %>' ) );
					}
				}
			},
			release: {
				files: [{
					cwd: 'build/',
					src: [ '**' ],
					expand: true,
					dest: 'release/<%= pkg.version %>/'
				}]
			},
			shortcut: {
				files: [{
					cwd: 'build/',
					src: [ '**' ],
					expand: true,
					dest: ''
				}]
			}
		},

		concat: {
			options: {
				process: {
					data: { version: '<%= pkg.version %>' }
				}
			},
			legacy: {
				src: [ 'src/CSVParser.js', 'src/json2.js' ],
				dest: 'build/CSVParser-legacy.js'
			}
		},

		uglify: {
			main: {
				src: 'build/CSVParser.js',
				dest: 'build/CSVParser.min.js'
			},
			min: {
				src: 'build/CSVParser-legacy.js',
				dest: 'build/CSVParser-legacy.min.js'
			}
		},

		qunit: {
			main: 'test/index.html'
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.registerTask( 'default', [ 'copy:build', 'concat', 'uglify', 'qunit' ]);
	grunt.registerTask( 'release', [ 'default', 'copy:release', 'copy:shortcut' ]);

};