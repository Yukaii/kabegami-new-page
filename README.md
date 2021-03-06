# 分頁壁紙君 - Chrome 擴充功能

![marquee](./docs/images/Marquee.png)

在新分頁隨機顯示桌布！

[![Build Status](https://travis-ci.org/Yukaii/kabegami-new-page.svg?branch=develop)](https://travis-ci.org/Yukaii/kabegami-new-page) [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fbbdincgjgdmbbkongmineooghpadbgk)][chrome-web-store] [![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/fbbdincgjgdmbbkongmineooghpadbgk)][chrome-web-store] [![Chrome Web Store](https://img.shields.io/chrome-web-store/users/fbbdincgjgdmbbkongmineooghpadbgk)][chrome-web-store] [![time tracker](https://wakatime.com/badge/github/Yukaii/kabegami-new-page.svg)](https://wakatime.com/badge/github/Yukaii/kabegami-new-page)

[chrome-web-store]: https://chrome.google.com/webstore/detail/kanaheis-new-page/fbbdincgjgdmbbkongmineooghpadbgk

## Screenshots

[![Kanahei's New Page](https://cdn.rawgit.com/Yukaii/kanahei-wallpapers/127b5c1b/docs/images/demo.gif)](https://www.youtube.com/watch?v=06aZmi58VCc "Kanahei's New Page")

## Changelog

[Changelog 看這裡](https://hackmd.io/@yukai/kabegami-new-page)

## NPM Pakcage

[![npm](https://img.shields.io/npm/v/kanahei-wallpapers.svg)](https://www.npmjs.com/package/kanahei-wallpapers)

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

