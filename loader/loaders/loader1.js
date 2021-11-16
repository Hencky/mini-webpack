function loader(source) {
  // loader的参数是源代码
  console.log('loader-1');
  return source;
}

loader.pitch = function () {
  console.log('loader1-pitch');
};

module.exports = loader;
