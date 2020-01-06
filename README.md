# `@mkt/babel-plugin-try-catch`

> 用try catch包裹你的函数，避免程序奔溃，以及上报异常和告警

## Install

### With Yarn

```sh
yarn add @mkt/babel-plugin-try-catch
```

### With NPM

```sh
npm i @mkt/babel-plugin-try-catch
```

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
            ['@mkt/babel-plugin-try-catch', { 
              catchHandler: (() => { 
                return (errorInfo) => {
                  console.log(error, errorInfo);
                  console.log('An error occured');
                } 
              }).toString()
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
        console.log(error, errorInfo);
        console.log('An error occured');
    }
}
```

## 配置项
该插件有且仅有一个配置项。  
1、<code>catchHandler</code>: 默认值为undefined。为一个返回一个回调函数的函数，但由于babel的配置项的值必须为number/string/boolean，所以你需要把这个函数字符串化后传给本babel plugin，只要调用这个函数但toString方法即可，如上面例子那样。这个函数的回调函数请设置一个参数，该参数将会包含了你要包裹的函数的四个重要信息: 函数所在的文件、函数名、函数的行以及函数的列。这四个信息是你定位error所需要的重要信息，最后打包后的代码，会生成一个变量名和这个回调函数传入的参数名一样的变量，该变量即是包含了这四个信息的值的变量，如上所示。  
2、<code>limitLine</code>:   默认值为0。函数体行数低于这个值的函数不会被try catch包裹，比如设为1，那么行数小于等于1的函数都不会被包裹。

## 说明
1、由于想要获取到原文件中最原始的数据，所以请把这个plugin放在第一位。  
2、由于在webpack打包的过程中，各种各样的loader或者plugin可能会在本plugin前改变到原始的文件，所以行列信息可能不太准确，本插件只会保证尽量获取正确的行列信息，但不保证一定准确。文件名和函数名才是最重要的信息。  
3、如果你不想你的函数被try catch，你可以在函数体开始的位置设置一个注释，只要该注释包含disable-try-catch的字符串，那么该插件便会跳过该函数。