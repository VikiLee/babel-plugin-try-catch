var assert = require('assert');
var Plugin = require('./Plugin');
var _slice = Array.prototype.slice;

module.exports = function (babel) {
  var plugin = null;

  function applyInstance(method, args, context) {
    if (plugin[method]) {
      plugin[method].apply(plugin, _slice.call(args).concat(context));
    }
  }
  
  return {
    name: 'babel-plugin-try-catch',
    visitor: {
      'ArrowFunctionExpression|FunctionExpression|FunctionDeclaration': function(path, state) {
        assert(state.opts.catchHandler, 'catchHandler should be provided');
        plugin = new Plugin(
          babel.types,
          state.opts.catchHandler
        );
        applyInstance(path.type, arguments, this);
      },
      ClassDeclaration(path, state) {
        assert(state.opts.catchHandler, 'catchHandler should be provided');
        plugin = new Plugin(
          babel.types,
          state.opts.catchHandler
        );
        applyInstance('ClassDeclaration', arguments, this);
      },
      ObjectExpression(path, state) {
        assert(state.opts.catchHandler, 'catchHandler should be provided');
        plugin = new Plugin(
          babel.types,
          state.opts.catchHandler
        );
        applyInstance('ObjectExpression', arguments, this);
      }
    }
  };
};