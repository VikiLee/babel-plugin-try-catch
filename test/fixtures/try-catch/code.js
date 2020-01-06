var obj = {
  objFn() {
    console.log('object method')
    return 1
  },
  objFn1: function() {
    console.log('function expression in obj')
    return 1
  },
  objFn2: () => 0
};

class MyClass {
  constructor() {
    console.log('constructor method')
    return 1
  }

  classMethod() {
    console.log('class method')
    return 1
  }
}

var arrowFn = () => {
  console.log('arrow function expression')
  return 1
}

var functionExpression = function() {
  console.log('normal function expression')
  return 1
}

function functionDeclaration() {
  console.log('function declaration')
  return 1
} 

function escapeTryCatch() {
  // disable-try-catch
  console.log('function declaration')
  return 1
} 

function escapeTryCatchLimitLine() {
  console.log('do not wrap with try catch only 1 line block statement')
} 