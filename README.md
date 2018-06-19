# 卡娜赫拉的新分頁 - Chrome 擴充功能

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fbbdincgjgdmbbkongmineooghpadbgk.svg?)](https://chrome.google.com/webstore/detail/kanaheis-new-page/fbbdincgjgdmbbkongmineooghpadbgk)

[![Kanahei's New Page](https://cdn.rawgit.com/Yukaii/kanahei-wallpapers/127b5c1b/docs/images/demo.gif)](https://www.youtube.com/watch?v=06aZmi58VCc "Kanahei's New Page")

## NPM Pakcage

```bash
npm install -g kanahei-wallpapers
```

### CLI Tool

```bash
kanahei # this will change your wallpaper
```

### API

```javascript
const { getOne } = require('kanahei-wallpapers')

getOne().then(wallpaper => console.log(wallpaper))
```

Will outputs:

```javascript
{ title: '湖のほとりの小鳥2',
  images:
   [ 'http://www.kanahei.com/upload/2016/06/2_k_1280_1024.jpg',
     'http://www.kanahei.com/upload/2016/06/2_k_1600_1200.jpg',
     'http://www.kanahei.com/upload/2016/06/2_k_1920_1200.jpg' ] }
```

