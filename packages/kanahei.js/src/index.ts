import 'cross-fetch/polyfill'
import cheerio, { CheerioAPI } from 'cheerio'

const kabegami = 'http://www.kanahei.com/kabegami/'

interface IWallpaper {
  images: string[]
}

function parsePagesCount ($: CheerioAPI): number {
  const pageIndexes = $('.wp-pagenavi a.page')
                        .toArray()
                        .map(elem => parseInt($(elem).text(), 10))

  return Math.max.apply(null, pageIndexes)
}

function kabegamiURL (page = 1) {
  if (page == 1) {
    return kabegami
  } else {
    return `${kabegami}page/${page}/`
  }
}

async function fetchPage (url = kabegami) {
  try {
    const res = await fetch(url)
    if (res.status >= 400) {
      throw new Error ('Request failed')
    }
    return await res.text()
  } catch (error) {
    console.error(error)
  }
}

function parseWallpapers ($: CheerioAPI): IWallpaper[] {
  return $('.col-xs-6.col-sm-4.col-md-3').toArray().map(elem => {
    const wallpaper = $(elem)
    const images = wallpaper
      .find('a')
      .toArray()
      .map(elem => $(elem).attr('href'))
      // filter out calendar wallpaper
      .filter(href => !href.match(/_c.jp(e)?g$/))

    return { images }
  })
}

function getRandomWallpaper (html : string) {
  const $ = cheerio.load(html)
  const wallpapers = parseWallpapers($)

  const random = oneToN(wallpapers.length)
  return wallpapers[random - 1];
}

function oneToN (count: number) {
  return Math.floor(Math.random() * count) + 1
}

async function fetchPageCount () {
  const html = await fetchPage(kabegami)
  const $ = cheerio.load(html)
  return parsePagesCount($)
}

export async function getOne () {
  const pageCount = await fetchPageCount()

  const randomPageCount = oneToN(pageCount)
  const randomPageURL = kabegamiURL(randomPageCount)

  return getRandomWallpaper(await fetchPage(randomPageURL))
}

export async function getAll () {
  const pageCount = await fetchPageCount()

  const arraysOfWallpapers = await Promise.all(Array.from({length: pageCount}, (_, k) => k+1).map(async page => {
    const pageURL = kabegamiURL(page)
    const html = await fetchPage(pageURL)

    const $ = cheerio.load(html)
    return parseWallpapers($)
  }))

  return arraysOfWallpapers.reduce((all, ws) => all.concat(ws), [])
}
