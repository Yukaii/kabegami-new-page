#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const wallpaper = require('wallpaper');
const got = require('got');
const tempfile = require('tempfile');

import { getOne } from './index'

const main = async () => {
  const w = await getOne()
  const input = w.images[w.images.length - 1]

  const file = tempfile(path.extname(input));

  got
    .stream(input)
    .pipe(fs.createWriteStream(file))
    .on('finish', () => {
      wallpaper.set(file, {scale: true});
    });
}

main()
