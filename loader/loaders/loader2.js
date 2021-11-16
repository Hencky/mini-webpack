function loader(source) {
  // loader的参数是源代码
  console.log('loader-2');
  return source;
}

loader.pitch = function () {
  console.log('loader2-pitch');
};

module.exports = loader;
