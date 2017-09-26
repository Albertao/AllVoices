# AllVoices
基于多家音乐平台集成的音乐app，创意来源于[listen1](https://github.com/listen1/listen1)

AllVoices是一个使用react-native技术编写的音乐app，基于国内多家音乐平台（目前已集成虾米音乐，网易云音乐），让你不必再只为了听某个歌手的歌曲而专门去下载其他音乐app

此外，此版本中还集成了歌单功能，你可以将来自不同平台的音乐填充入同一张歌单中。Hope you can enjoy it!

# 技术栈：
react-native + react-redux，目前仅支持android客户端

# 软件截图：

![首页](http://og2bqlbn5.bkt.clouddn.com/shot.png)
![歌曲播放界面](http://og2bqlbn5.bkt.clouddn.com/shot2.png)
![歌单详情页面](http://og2bqlbn5.bkt.clouddn.com/shot3.png)
![歌单管理界面](http://og2bqlbn5.bkt.clouddn.com/shot4.png)

# 安装

请[在此](https://github.com/Albertao/AllVoices/releases/tag/v0.1.0)下载Android apk

# 运行开发

确定你已安装了安卓sdk，可以参考[这里](http://reactnative.cn/docs/0.48/getting-started.html)，之后确保你已经安装了android ndk（主要是为了满足热更新库的要求），并设置ANDROID_NDK_HOME环境变量指向你ndk的安装地址，如`C:\android\sdk\ndk\android-ndk-r15c`

`git clone https://github.com/Albertao/AllVoices.git`

`npm install -g react-native-cli`

`npm install`

`react-native link`

`react-native run-android`

# 联系我

欢迎在issue页面提出issue！

# TODO:

- [ ] 美术资源（如logo，启动页等）改进
- [ ] 完善热更新机制
- [ ] 完成分享功能
- [ ] 集成更多音乐平台
- [ ] 完善搜索功能
- [ ] 加入歌曲下载功能
- [ ] ios客户端
