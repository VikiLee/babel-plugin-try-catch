
var template = require("@babel/template");

var Plugin = function(
  types,
  catchBody
) {
  this.types = types;
  this.catchHandler = new Function('error', catchBody);
}

function getFilename(filename) {
  return filename.replace(process.cwd(), '')
}

function regExpEscape (s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
function wildcardToRegExp (s) {
  return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

var DISABLE_COMMENT = 'disable-try-catch'; // 不想被try catch包裹的注解内容
var LIMIT_LINE = 0; // 函数体行数小于这个值的函数不try catch，默认是0行，即空函数不try catch

Plugin.prototype.tramsform = function(path, state) {
  try {
    var types = this.types, 
        node = path.node,
        params = node.params,
        blockStatement = node.body,
        isGenerator = node.generator,
        isAsync = node.async,
        loc = node.loc,
        filename = getFilename(state.file.opts.filename);

    // 如果获取不到loc，说明是有问题的，应该是其他plugin或者preset的plugin生成的函数，不处理
    if (!loc) {
      return;
    }
    // 1、如果文件在include数组中则执行try catch
    // 2、如果文件在exclude数组中，则不执行try catch
    // 3、include优先级高，即如果配置了include，则exclude无效
    var arr = [];
    if (state.opts.include) {
      arr = Array.isArray(state.opts.include) ? state.opts.include : [state.opts.include];
      for (var i = 0; i < arr.length; i++) {
        if (!wildcardToRegExp(arr[i]).test(state.file.opts.filename)) {
          return;
        }
      }
    } else if (state.opts.exclude) {
      arr = Array.isArray(state.opts.exclude) ? state.opts.exclude : [state.opts.exclude];
      for (var i = 0; i < arr.length; i++) {
        if (wildcardToRegExp(arr[i]).test(state.file.opts.filename)) {
          return;
        }
      }
    }
    // get function name
    var funcName = 'anonymous function';
    if (node.id) {
      funcName = node.id.name
    } else if (node.key) {
      // class method name
      funcName = node.key.name
    }else if (types.isVariableDeclarator(path.parentPath)) {
      funcName = path.parentPath.node.id.name;
    } else if (types.isProperty(path.parentPath)) {
      funcName = path.parentPath.node.key.name;
    } 

    // 1、如果有try catch包裹了，则不需要 
    // 2、防止circle loops 
    // 3、需要try catch的只能是语句，像() => 0这种的body，是不需要的
    // 4、如果函数体行数小于等于‘LIMIT_LINE’行不try catch，默认为0行，用户可以通过limitLime的option设置
    LIMIT_LINE = state.opts.limitLine || LIMIT_LINE;
    if (blockStatement.body && types.isTryStatement(blockStatement.body[0])
      || !types.isBlockStatement(blockStatement) && !types.isExpressionStatement(blockStatement)
      || blockStatement.body && blockStatement.body.length <= LIMIT_LINE) {
      return;
    }
    // 将catch handler转为AST节点 然后从AST节点中获取函数体 作为catch里面的内容
    var catchStatement = template.statement(`var tmp = ${this.catchHandler.toString()}`)();
    var catchBody = catchStatement.declarations[0].init.body; 

    // 赋值语句 值包含了函数的行列数和函数名
    var infoDeclaration = types.variableDeclaration('var', [
      types.variableDeclarator(
        types.identifier('info'),
        types.ObjectExpression([
          types.objectProperty(types.identifier('line'), types.numericLiteral(loc.start.line)),
          types.objectProperty(types.identifier('row'), types.numericLiteral(loc.start.column)),
          types.objectProperty(types.identifier('function'), types.stringLiteral(funcName)),
          types.objectProperty(types.identifier('filename'), types.stringLiteral(filename))
        ]))
    ]);

    // 获取函数开头注释，如果注释为disable-try-catch则跳过try catch
    var commentsNode = blockStatement.body.length > 0
      ? blockStatement.body[0].leadingComments
      : blockStatement.innerComments || blockStatement.trailingComments
    if (commentsNode && commentsNode[0].value.indexOf(DISABLE_COMMENT) > -1) {
      path.skip();
      return;
    }

    var catchClause = types.catchClause(types.identifier('error'), types.blockStatement(
      [infoDeclaration].concat(catchBody.body)
    ));
    var tryStatement = types.tryStatement(blockStatement, catchClause);

    var func = null;
    // 区分类方法、对象方法、函数申明还是函数表达式
    if (types.isClassMethod(node)) {
      func = types.classMethod(node.kind, node.key, params, types.BlockStatement([tryStatement]), node.computed, node.static);
    } else if (types.isObjectMethod(node)) {
      func = types.objectMethod(node.kind, node.key, params, types.BlockStatement([tryStatement]), node.computed);
    } else if (types.isFunctionDeclaration(node)) {
      func = types.functionDeclaration(node.id, params, types.BlockStatement([tryStatement]), isGenerator, isAsync);
    } else {
      func = types.functionExpression(node.id, params, types.BlockStatement([tryStatement]), isGenerator, isAsync);
    }
    path.replaceWith(func);
  } catch(error) {
    console.error(error);
  }
}

Plugin.prototype.ArrowFunctionExpression = function(path, state) {
  this.tramsform(path, state);
}

Plugin.prototype.FunctionExpression = function(path, state) {
  this.tramsform(path, state);
}

Plugin.prototype.FunctionDeclaration = function(path, state) {
  this.tramsform(path, state);
}

Plugin.prototype.ClassDeclaration = function(path, state) {
  var _this = this;
  path.traverse({
    ClassMethod(path) {
      _this.tramsform(path, state);
    }
  });
}

Plugin.prototype.ObjectExpression = function(path, state) {
  var _this = this;
  path.traverse({
    ObjectMethod(path) {
      _this.tramsform(path, state);
    }
  });
}

module.exports = Plugin