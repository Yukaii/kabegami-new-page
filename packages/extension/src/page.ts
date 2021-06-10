import { CollectionStore, ImageStore, Configuration, IConfiguration } from './app/lib/store'
import 'primer/index.scss';
import { firstLoadRandomWallpaper } from '@kabegami-new-page/default-sets';

let config : IConfiguration

async function getImageFromCollection (): Promise<string> {
  const collections = await CollectionStore.all();
  const selectedCollection = collections.find(c => c.id === config.selectedCollectionId);
  const imageStore = await ImageStore.getStore();

  if (typeof selectedCollection === 'undefined') {
    return firstLoadRandomWallpaper();
  } else {
    const randomImageId = selectedCollection.imageIds[Math.floor(Math.random() * selectedCollection.imageIds.length)]

    return imageStore[randomImageId].path
  }
}

async function loadImage (config: IConfiguration) {
  let image: string;

  if (!config || !config.selectedCollectionId) {
    image = firstLoadRandomWallpaper();
  } else {
    image = await getImageFromCollection();
  }
  return image
}

function createImageNode (src: string) {
  const imageNode = document.createElement('img')
  imageNode.src = src
  return imageNode
}

async function refreshImage (config: IConfiguration) {
  const src = await loadImage(config)
  const imageNode = createImageNode(src)

  imageNode.onload = function () {
    const imageContainer = document.querySelector('.image-container') as HTMLElement
    imageContainer.className = 'image-container hide'
    window.setTimeout(() => {
      imageContainer.style.backgroundImage = `url(${src})`
      window.setTimeout(() => {
        document.querySelector('.image-container').className = 'image-container'
      }, 100)
    }, 300)
  }
}

window.onload = async function () {
  config = await Configuration.getAll();
  const src = await loadImage(config)
  const imageNode = createImageNode(src)

  imageNode.onload = function () {
    const body = document.querySelector('body')

    const imageContainer = document.createElement('div')
    imageContainer.className = 'image-container hide'
    imageContainer.style.backgroundImage = `url(${src})`

    body.appendChild(imageContainer)

    window.setTimeout(() => {
      document.querySelector('.image-container').className = 'image-container'

      window.setTimeout(() => require('./app'), 300);
    }, 100)
  }

  window.setInterval(() => refreshImage(config), 60 * 1000)
}
