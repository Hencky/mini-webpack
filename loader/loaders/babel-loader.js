const babel = require('@babel/core');
const loaderUtils = require('loader-utils');

function loader(source) {
  const options = loaderUtils.getOptions(this);
  const callback = this.async();

  babel.transform(
    source,
    {
      ...options,
      sourceMap: true,
      filename: this.resourcePath.split('/').pop(),
    },
    function (error, result) {
      callback(error, result.code, result.map);
    }
  );
}

module.exports = loader;
