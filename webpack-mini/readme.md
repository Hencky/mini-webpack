## 简单的webpack实现

1) 构建文档依赖关系
根据入口路径获取模块内容，解析模块，构建 { path: Source }(路径:源码) 的依赖列表。模块解析是将源码构建ast，通过ast遍历读取require依赖，并替换源码（require =》 __webpack__require__）,再进行深度解析。

2）创建打包文件
首先创建打包模板（基于原生webpack打包文件修改),根据依赖列表渲染打包模板，再创建文件。

3) loader
loader即一段脚本函数。读取文档内容时，根据路径匹配依次使用loader，更改文档内容。

4) plugins
基于tapable将执行函数放到webpack运行代码中，类似生命周期。插件里编写要执行的函数即可。