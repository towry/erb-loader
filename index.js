
var fs = require('fs');
var path = require('path');
var hash = require('sha1');

var CONFIG_NAME = 'webpackrails';
var CONFIG_ROOT_NAME = 'root';
var TMP_CACHE_PATH = 'tmp/cache/webpackrails/erbs';
var LOADER_NAME = 'erb-loader';

module.exports = function(source) {
    this.cacheable && this.cacheable();
    
    var config = {
      root_path: getRootPath.call(this),
    };

    var filename = hash(this.resource);
    var fullpath = path.join(config.root_path, filename);

    var result;

    var fd;

    try {
      var fd = fs.openSync(fullpath, 'r');
      result = fs.readSync(fd);
    } catch (e) {
      e.context = {
        error: 'Error when run webpack with loader: ' + LOADER_NAME,
        filename: this.resource,
      };

      console.error(e);
    } finally {
      if (fd) {
        fs.close(fd);
      }
      // make sure the rails receive this error
      process.exit(1); 
    }

    return result;
};

/**
 * Get the root path which store the erb files
 */
function getRootPath () {
  var options = this.options;

  if (!(CONFIG_NAME in options)) {
    throw new Error(LOADER_NAME + " works with `webpackrails` gem, please provide a webpackrails config.");
  }

  var webpackrails = options[CONFIG_NAME];
  if (!(CONFIG_ROOT_NAME in webpackrails)) {
    throw new Error(LOADER_NAME + " need to know the rails app root path.");
  }

  var root = webpackrails[CONFIG_ROOT_NAME];
  root = root || '';

  return path.join(root, TMP_CACHE_PATH);
}