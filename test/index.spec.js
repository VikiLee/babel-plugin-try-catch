const pluginTester = require('babel-plugin-tester').default;
const plugin =  require('../lib');
const path = require('path');

pluginTester({
  plugin,
  pluginOptions: {
    catchHandler: (() => { 
      return (info) => {
        console.log(info, error);
      } 
    }).toString(),
    limitLine: 1
  },
  fixtures: path.join(__dirname, 'fixtures')
})