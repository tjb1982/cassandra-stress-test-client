
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("hoquet", function (exports, module) {
Hoquet = function() {};

Hoquet.prototype.render = function(a) {

  return arguments.length < 2 ? _render(a)
  : Array.prototype.map.call(arguments, _render, this).join('');

};

Hoquet.prototype.scripts = function(src) {
  return src instanceof Array ? src.map(_script, this).join('')
  : arguments.length > 1 ? Array.prototype.map.call(arguments, _script, this).join('')
  : _script(src);
};

Hoquet.prototype.styles = function(src) {
  return src instanceof Array ? src.map(_style, this).join('')
  : arguments.length > 1 ? Array.prototype.map.call(arguments, _style, this).join('')
  : _style(src);
};

Hoquet.prototype.doc = function(type, a) {
  return (
    type === 'html5' ? '<!doctype html>' : '<!doctype html>'
  ) + this.render(a);
};

Hoquet.prototype.renderFile = function(file, context, callback) {
  var fs;
  try {
    fs = require("fs");
    fs.readFile(file, 'utf8', function(e, data) {
      e ? callback(e)
      : (function() {
        var oldexports = module.exports,
            forms = eval(data);

        callback(
          null, (
            typeof main === 'function' ? main(context)
            : exports && typeof exports.main === 'function' ? exports.main(context)
            : module && typeof module.exports === 'function' ? module.exports(context)
            : Hoquet.prototype.doc('html5', forms)
          )
        );
        module.exports = oldexports;

      })();
    });
  } catch (e) {
    callback(e);
  }
}

module.exports = new Hoquet;


function _script(src) {
  return Hoquet.prototype.render(["script", {"type":"text/javascript", "src":src}, '']);
}

function _style(src) {
  return Hoquet.prototype.render([
    "link", {
      "rel":"stylesheet",
      "type":"text/css",
      "href":src
    }
  ]);
};

function isPrintable(tester) {
  return typeof tester === 'string' || tester && isNumber(tester);
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInvalidTagName(tester) {
  return !tester || typeof tester !== 'string' || isNumber(tester[0]);
}

function _render (a) {

  return isPrintable(a) ? a
  : !(a instanceof Array) ? ''
  : a[0] instanceof Array ? a.map(_render, this).join('')
  : isInvalidTagName(a[0]) ? new Error(a[0] + ' is not a valid tag name.')
  : (function() {

    var
    last = a.length > 1 && a[a.length - 1],
    selfClosing = a.length > 2 ? false
    : typeof last === 'undefined' ? false
    : last instanceof Array ? false
    : isPrintable(last) ? false
    : true;

    return a.map(function(form, i) {

      return i < 1 ? '<' + form
      : i === 1 &&
        form instanceof Object &&
        !(form instanceof Array) ? Object.keys(form).map(function(key) {
        return form[key] ? ' ' + key + '=' + '"' +
          ( form[key] instanceof Array ? form[key].join(' ') : form[key] ) +
          '"'
        : ' ' + key;
      }).join('') + (!selfClosing ? '>' : '')
      : (i === 1 && !selfClosing ? '>' : '') + (
        form instanceof Array && form.length ? _render(form)
        : isPrintable(form) ? form : ''
      );

    }).join('') + (
      !selfClosing ? '</' + a[0] + '>'
      : ' />'
    );

  })();
}



});

if (typeof exports == "object") {
  module.exports = require("hoquet");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("hoquet"); });
} else {
  this["hoquet"] = require("hoquet");
}
})()
