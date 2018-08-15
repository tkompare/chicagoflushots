module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/js/*.js'],
				dest: 'src/js-concat/index-concat.js'
			}
		},

		uglify: {
			options: {
				mangle: true
			},
			build: {
				src: 'src/js-concat/index-concat.js',
				dest: 'htdocs/js/index.min.js'
			}
		},

		watch: {
			scripts: {
				files: 'src/js/*.js',
				tasks: ['concat', 'uglify:build'],
				options: {
					atBegin: true
				}
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['concat','uglify']);

};