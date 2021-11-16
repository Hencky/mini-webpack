// 根据图片生成一个md5 发射到dist目录下
// file-loader还会返回当前的路径

const loaderUtils = require('loader-utils');


function loader(source) {
  const filename = loaderUtils.interpolateName(this, '[hash].[ext]', { content: source })

  this.emitFile(filename, source);
  console.log('source', source)
  return source;
}


loader.raw = true; // 二进制


module.exports = loader;