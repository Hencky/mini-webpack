const str = require('./a.js');

console.log('abc');

//  loader的特点
// 每一个loader返回js脚本
// 每一个loader只做一件事，为了使loader在更多场景链式调用
// 每一个loader都是一个模块
// 每个loader都是无状态的，确保loader在不同模块转换之间不保存状态

class Demo {
  constructor() {
    this.name = 'demo';
  }

  getName() {
    return this.name;
  }
}

const d = new Demo();
console.log(d.getName());
