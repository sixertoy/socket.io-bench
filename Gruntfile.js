/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
        jshintrc: '.jshintrc',
        files: ['clients/**/*.js', 'lib/**/*.js', 'server/*.js', '!node_modules/**/*', '!server/node_modules/**/*']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint']);

};
