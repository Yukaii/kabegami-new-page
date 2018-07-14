const kanaheiWallpapers = require('./kanahei.json')

type DefaultCollection = { name: string, images: string[] }

export const defaultCollections: DefaultCollection[] = [{
    name: 'カナヘイ',
    images: kanaheiWallpapers.wallpapers.map(w => w.images[w.images.length - 1])
  },
  {
    name: 'Snoopy',
    images: require('./snoopy.json')
  }
]

export function firstLoadRandomWallpaper (): string {
  const wallpapers = kanaheiWallpapers.wallpapers
  const wallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];

  // load lowest resolution for the first time
  const image = wallpaper.images[0]

  return image
}