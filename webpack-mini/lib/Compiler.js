const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generator = require('@babel/generator').default;
const ejs = require('ejs');
const tapable = require('tapable');

const { SyncHook } = tapable;

class Compiler {
  constructor(config) {
    this.config = config; // entry output
    // 1） 保存入口文件的路径
    this.entryId; // ./src/index.js
    // 2) 保存所有的模块依赖
    this.modules = {};
    this.entry = config.entry; // 入口路径

    this.root = process.cwd(); // 工作路径

    this.hooks = {
      entryOption: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook(),
    };
    // 如果传递了plugins参数
    const plugins = this.config.plugins;
    if (Array.isArray(plugins)) {
      plugins.forEach((plugin) => {
        plugin.apply(this);
      });
    }

    this.hooks.afterPlugins.call();
  }

  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf-8');

    // 拿到每个规则来处理loader
    const { rules } = this.config.module;
    for (let i = 0; i < rules.length; i += 1) {
      const { test, use } = rules[i];
      let len = use.length - 1;
      if (test.test(modulePath)) {
        // 这个模块需要通过loader转换
        // 获取对应的loader函数
        function normalLoader() {
          const loader = require(use[len]);
          len -= 1;
          content = loader(content);
          if (len >= 0) {
            normalLoader();
          }
        }

        normalLoader();
      }
    }

    return content;
  }

  // 解析源码
  parse(source, parentPath) {
    const ast = babylon.parse(source);
    const dependencies = []; // 依赖的数组

    traverse(ast, {
      CallExpression({ node }) {
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__';
          let moduleName = node.arguments[0].value;
          moduleName = './' + path.join(parentPath, moduleName);
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js');
          dependencies.push(moduleName);
          node.arguments = [t.stringLiteral(moduleName)];
        }
      },
    });

    const sourceCode = generator(ast).code;

    return {
      sourceCode,
      dependencies,
    };
  }

  buildModule(modulePath, isEntry) {
    // 拿到模块的内容
    const source = this.getSource(modulePath);
    // 模块id modulePath modulePath - this.root  获取相对路径 src/index
    const moduleName = './' + path.relative(this.root, modulePath);

    if (isEntry) {
      this.entryId = moduleName; // 保存入口名称
    }

    // 解析需要把source源码进行改造， 返回一个依赖列表
    const { sourceCode, dependencies } = this.parse(
      source,
      path.dirname(moduleName)
    );

    this.modules[moduleName] = sourceCode;
    dependencies.forEach((dep) => {
      this.buildModule(path.join(this.root, dep), false);
    });
  }

  emitFile() {
    // 用数据渲染到输出目录
    const mainPath = path.join(
      this.config.output.path,
      this.config.output.filename
    );

    const templateStr = this.getSource(path.join(__dirname, 'main.ejs'));

    const code = ejs.render(templateStr, {
      entryId: this.entryId,
      modules: this.modules,
    });

    this.assets = {};
    // 资源中路径对应的代码
    this.assets[mainPath] = code;
    fs.writeFileSync(mainPath, code);
    this.hooks.emit.call();
  }

  // 执行
  run() {
    this.hooks.run.call();

    // 执行 并且创建模块的依赖关系
    this.buildModule(path.resolve(this.root, this.entry), true);

    this.hooks.afterCompile.call();

    // 发射一个打包后的文件
    this.emitFile();


    this.hooks.done.call();
  }
}

module.exports = Compiler;
