# `@kabegami-new-page/kanahei.js`

[![npm](https://img.shields.io/npm/v/@kabegami-new-page/kanahei.js.svg)](https://www.npmjs.com/package/@kabegami-new-page/kanahei.js)

Part of [Kabegami New Page](https://github.com/Yukaii/kabegami-new-page) chrome extension.

## Installation

```bash
npm install @kabegami-new-page/kanahei.js
```

## Usage

```javascript
import { getOne } from '@kabegami-new-page/kanahei.js'

getOne().then(wallpaper => console.log(wallpaper))

/* 
 => { title: '湖のほとりの小鳥2',
  images:
   [ 'http://www.kanahei.com/upload/2016/06/2_k_1280_1024.jpg',
     'http://www.kanahei.com/upload/2016/06/2_k_1600_1200.jpg',
     'http://www.kanahei.com/upload/2016/06/2_k_1920_1200.jpg' ] }
 */
```

### CLI Tool

Install this package globally will add `kanahei` command. Run the command, and your wallpaper will be changed to kanahe's random wallpaper.

```bash
npm install -g @kabegami-new-page/kanahei.js
kanahei
```

## License

MIT
