module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: ['dist/']
    },
    watch: {
      files: ['index.js'],
      tasks: ['browserify']
    },
    browserify: {
      dist: {
        files: {
          'bundle.js': ['index.js'],
        }
      }
    },
    copy: {
      dist: {
        files: [ {src: 'index.*', dest: 'dist/'} ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');



  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', ['clean','browserify', 'copy']);

};
