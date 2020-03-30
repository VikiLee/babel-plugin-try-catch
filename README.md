# `babel-plugin-try-catch`

> 用try catch包裹你的函数，避免程序奔溃，以及上报异常和告警

## Usage
babel-loader中配置：
```
module: {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        plugins: [
            ['babel-plugin-try-catch', { 
              catchHandlerBody: '{
                  console.log(info); // info包含了出错的文件、方法名以及行列信息
                  console.log('An error occured');
                }',
               include: '/src/**/action.ts' // 所有src文件夹下名为action.ts文件里面的函数才进行try catch包裹
            }]
        ]
      }
    }
  ]
```
运行前:
```
// src/index.js
function test() {
    // do stuff
}
```
打包后的结果:
```
function test() {
    try {
        // do stuff
    } catch(error) {
        var errorInfo = { 
            line: 115, 
            row: 30, 
            function: "test", 
            filename: "/src/index.js"
        }
        console.log(error);
        console.log('An error occured');
    }
}
```

## 配置项
该插件有且仅有一个配置项。  
1、<code>catchHandlerBody</code>: 默认值为undefined。catch体，但由于babel的配置项的值必须为number/string/boolean，所以你需要把catch里面的内容字符化后传给babel plugin，如上面例子那样。这个函数体你可以使用info变量，该变量会包含了你要包裹的函数的四个重要信息: 函数所在的文件、函数名、函数的行以及函数的列。这四个信息是你定位error所需要的重要信息，最后打包后的代码，会生成一个变量名和这个回调函数传入的参数名一样的变量，该变量即是包含了这四个信息的值的变量，如上所示。  
2、<code>limitLine</code>: 默认值为0。函数体行数低于这个值的函数不会被try catch包裹，比如设为1，那么行数小于等于1的函数都不会被包裹。  
3、<code>include</code>: 默认为空，该属性支持通配符，如果配置了该属性，则只会包裹该属性匹配到的文件里面的函数，不会包括不匹配的文件的函数 
4、<code>exclude</code>: 默认为空，该属性支持通配符，如果配置了该属性，则不会包裹该属性匹配到的文件里面的函数，注意如果include和exclude同时配置了，则以include为准。

## 说明
1、由于想要获取到原文件中最原始的数据，所以请把这个plugin放在第一位。  
2、由于在webpack打包的过程中，各种各样的loader或者plugin可能会在本plugin前改变到原始的文件，所以行列信息可能不太准确，本插件只会保证尽量获取正确的行列信息，但不保证一定准确。文件名和函数名才是最重要的信息。  
3、如果你不想你的函数被try catch，你可以在函数体开始的位置设置一个注释，只要该注释包含disable-try-catch的字符串，那么该插件便会跳过该函数。