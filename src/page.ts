import { getOne } from './index'

window.onload = async function () {
  const wallpaper = await getOne();
  const image = wallpaper.images[0]

  const img = document.createElement('img')
  img.src = image
  img.onload = function () {
    const body = document.querySelector('body')

    const imageContainer = document.createElement('div')
    imageContainer.className = 'image-container hide'
    imageContainer.style.backgroundImage = `url(${image})`

    body.appendChild(imageContainer)

    window.setTimeout(() => document.querySelector('.image-container').className = 'image-container', 0)
  }
}
