const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolveLoader: {
    alias: {},
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  devtool: 'source-map',
  module: {
    // loader执行顺序,从右向左，从下到上
    // loader顺序   pre + normal + inline + post
    rules: [
      {
        test: /\.jpeg$/,
        use: 'file-loader',
      },
      {
        test: /\.js$/,
        use: {
          // 添加注释
          loader: 'banner-loader',
          options: {
            // text: 'made Hencky',
            filename: path.resolve(__dirname, 'banner.js'),
          },
        },
      },

      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },

      // 或者
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: 'loader1',
      //   },
      // },
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: 'loader2',
      //   },
      // },
    ],
  },
};
