'use strict';

var micromatch = require('micromatch');
var jstransformer = require('jstransformer');
var extend = require('extend-shallow');
var path = require('path');

function plugin (opts) {
  var isArray = Array.isArray(opts);
  var isObject = typeof opts !== 'object';

  if (!isArray && !isObject) {
    throw new TypeError('metalsmith-jstransformer expect array or object');
  }
  var transformers = {};

  // load transformers
  (isArray
      ? opts
      : isObject
        ? Object.keys(opts)
        : []
  ).forEach(function(name) {
    if (name) {
      // @todo use `lazy-require` for install transformer? specific version?
      transformers[name] = jstransformer(require('jstransformer-' + name));
    }
  });
  opts = isArray ? {} : opts;
  return function (files, metalsmith, done) {


    Object.keys(transformers).forEach(function(name) {
      var transform = transformers[name];
      var patterns = '*.' + transform.name;
      if (transform.inputFormats) {
        patterns = transform.inputFormats.map(function(format) {
          return '*.' + format;
        });
      }

      var filenames = micromatch(Object.keys(files), patterns, opts);

      filenames.forEach(function(filename) {
        var data = files[filename];
        var name = basename(fp) + '.' + transform.outputFormat;
        var locals = extend({}, data, metalsmith.metadata());
        var result = transform.render(data.contents, opts[name], locals);
      });
    });
  //     // Find all files that can be handled by the given transform.
  //     // TODO: Use .inputFormats().

  //     var process = Object.keys(files).filter(
  //       minimatch.filter('*.' + transform, {
  //         matchBase: true
  //       })
  //     );

  //     // Loop through each transformable file.
  //     for (var file in process) {
  //       var filename = process[file];
  //       var data = files[filename];
  //       var locals = mix(data, metalsmith.metadata());

  //       // Construct the new file name.
  //       var name = path.basename(filename, path.extname(filename));

  //       // Default to an .html file extension if none exists.
  //       if (path.extname(name) === '') {
  //         name = path.basename(filename, path.extname(filename)) + '.html';
  //       }

  //       // Process the file contents using the transformer.
  //       var result = transformers[transform].render(data.contents, locals);
  //       data.contents = new Buffer(result.body);

  //       // Replace the file with the newly processed one.
  //       delete files[filename];
  //       files[name] = data;
  //     }
  //   }

  //   done();
  // }
}

function basename(fp) {
  return fp.substr(0, fp.length - path.extname(fp).length);
}
module.exports = plugin;
