const kanaheiWallpapers: KanaheiWallpaper = require('../data/kanahei.json')

type DefaultCollection = { name: string, images: string[] }
type KanaheiWallpaper = Array<{
  images: string[]
}>

export const defaultCollections: DefaultCollection[] = [{
    name: 'カナヘイ',
    images: kanaheiWallpapers.map(w => w.images[w.images.length - 1])
  },
  {
    name: 'Snoopy',
    images: require('../data/snoopy.json')
  },
  {
    name: 'Doraemon',
    images: require('../data/doraemon.json')
  },
  {
    name: 'ちびまる子ちゃん',
    images: require('../data/chibimaruko.json')
  },
  {
    name: 'Elmo',
    images: require('../data/elmo.json')
  }
]

export function firstLoadRandomWallpaper (): string {
  const wallpaper = kanaheiWallpapers[Math.floor(Math.random() * kanaheiWallpapers.length)];

  // load lowest resolution for the first time
  const image = wallpaper.images[0]

  return image
}
