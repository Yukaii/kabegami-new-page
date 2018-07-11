const wallpapersStore = require('../extension/wallpapers.json')
import { CollectionStore, ImageStore, Configuration, IConfiguration } from './app/lib/store'
import 'primer/index.scss';

let config : IConfiguration

function firstLoadRandomWallpaper (): string {
  const wallpapers = wallpapersStore.wallpapers
  const wallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];

  const image = wallpaper.images[0]

  return image
}

async function getImageFromCollection (): Promise<string> {
  const collections = await CollectionStore.all();
  const selectedCollection = collections.find(c => c.id === config.selectedCollectionId);
  const imageStore = await ImageStore.getStore();

  const randomImageId = selectedCollection.imageIds[Math.floor(Math.random() * selectedCollection.imageIds.length)]

  return imageStore[randomImageId].path
}


window.onload = async function () {
  config = await Configuration.getAll();
  let image;

  if (!config || !config.selectedCollectionId) {
    image = firstLoadRandomWallpaper();
  } else {
    image = await getImageFromCollection();
  }

  const imageNode = document.createElement('img')
  imageNode.src = image

  imageNode.onload = function () {
    const body = document.querySelector('body')

    const imageContainer = document.createElement('div')
    imageContainer.className = 'image-container hide'
    imageContainer.style.backgroundImage = `url(${image})`

    body.appendChild(imageContainer)

    window.setTimeout(() => {
      document.querySelector('.image-container').className = 'image-container'

      window.setTimeout(() => require('./app'), 300);
    }, 100)
  }
}
