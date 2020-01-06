var obj = {
  objFn() {
    try {
      console.log("object method");
      return 1;
    } catch (error) {
      var info = {
        line: 2,
        row: 2,
        function: "objFn",
        filename: "/test/fixtures/try-catch/code.js"
      };
      console.log(info, error);
    }
  },

  objFn1: function() {
    try {
      console.log("function expression in obj");
      return 1;
    } catch (error) {
      var info = {
        line: 6,
        row: 10,
        function: "objFn1",
        filename: "/test/fixtures/try-catch/code.js"
      };
      console.log(info, error);
    }
  },
  objFn2: () => 0
};

class MyClass {
  constructor() {
    try {
      console.log("constructor method");
      return 1;
    } catch (error) {
      var info = {
        line: 14,
        row: 2,
        function: "constructor",
        filename: "/test/fixtures/try-catch/code.js"
      };
      console.log(info, error);
    }
  }

  classMethod() {
    try {
      console.log("class method");
      return 1;
    } catch (error) {
      var info = {
        line: 19,
        row: 2,
        function: "classMethod",
        filename: "/test/fixtures/try-catch/code.js"
      };
      console.log(info, error);
    }
  }
}

var arrowFn = function() {
  try {
    console.log("arrow function expression");
    return 1;
  } catch (error) {
    var info = {
      line: 25,
      row: 14,
      function: "arrowFn",
      filename: "/test/fixtures/try-catch/code.js"
    };
    console.log(info, error);
  }
};

var functionExpression = function() {
  try {
    console.log("normal function expression");
    return 1;
  } catch (error) {
    var info = {
      line: 30,
      row: 25,
      function: "functionExpression",
      filename: "/test/fixtures/try-catch/code.js"
    };
    console.log(info, error);
  }
};

function functionDeclaration() {
  try {
    console.log("function declaration");
    return 1;
  } catch (error) {
    var info = {
      line: 35,
      row: 0,
      function: "functionDeclaration",
      filename: "/test/fixtures/try-catch/code.js"
    };
    console.log(info, error);
  }
}

function escapeTryCatch() {
  // disable-try-catch
  console.log("function declaration");
  return 1;
}

function escapeTryCatchLimitLine() {
  console.log("do not wrap with try catch only 1 line block statement");
} 