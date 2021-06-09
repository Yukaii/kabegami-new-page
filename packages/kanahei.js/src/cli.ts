#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import wallpaper from 'wallpaper';
import got from 'got';
import tempfile from 'tempfile';

import { getOne } from '.'

const main = async () => {
  const w = await getOne()
  const input = w.images[w.images.length - 1]

  const file = tempfile(path.extname(input));

  got
    .stream(input)
    .pipe(fs.createWriteStream(file))
    .on('finish', () => {
      wallpaper.set(file, { scale: 'auto', screen: 'all' });
    });
}

main()
