module.exports = function ( grunt ) {

	'use strict';

	grunt.initConfig({

		pkg: grunt.file.readJSON( 'package.json' ),

		watch: {
			src: {
				files: [ 'src/**/*.js' ],
				tasks: [ 'clean:tmp', 'concat' ],
				options: {
					interrupt: true,
					force: true
				}
			}
		},

		clean: {
			tmp: [ 'tmp/' ],
			build: [ 'build/' ]
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [ 'tmp/CSVParser.js' ]
		},

		copy: {
			tmpToBuild: {
				files: [{
					cwd: 'tmp/',
					src: [ '**' ],
					expand: true,
					dest: 'build/'
				}]
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
			normal: {
				src: [ 'src/CSVParser.js' ],
				dest: 'tmp/CSVParser.js'
			},
			legacy: {
				src: [ 'src/CSVParser.js', 'src/json2.js' ],
				dest: 'tmp/CSVParser-legacy.js'
			}
		},

		uglify: {
			main: {
				src: 'tmp/CSVParser.js',
				dest: 'tmp/CSVParser.min.js'
			},
			min: {
				src: 'tmp/CSVParser-legacy.js',
				dest: 'tmp/CSVParser-legacy.min.js'
			}
		},

		qunit: {
			main: 'test/index.html'
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );

	grunt.registerTask( 'default', [ 'clean:tmp', 'concat', 'jshint', 'qunit', 'uglify', 'clean:build', 'copy:tmpToBuild' ]);
	grunt.registerTask( 'release', [ 'default', 'copy:release', 'copy:shortcut' ]);

};