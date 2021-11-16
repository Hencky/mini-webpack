const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const fs = require('fs');

function loader(source) {
  this.cacheable(false); // 缓存

  const options = loaderUtils.getOptions(this);
  const done = this.async();

  const schema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
      },
      filename: {
        type: 'string',
      },
    },
  };
  validateOptions(schema, options, 'banner-loader');

  if (options.filename) {
    this.addDependency(options.filename); // 文件变动重新打包
    fs.readFile(options.filename, 'utf-8', function (err, data) {
      done(err, `/**${data}**/${source}`);
    });
  } else {
    done(null, `/**${options.text}**/${source}`);
  }

}

module.exports = loader;
