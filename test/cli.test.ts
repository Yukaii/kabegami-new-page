import { assert } from 'chai'
import { getAll, getOne } from '../src/cli'

describe('Test real crawler', function () {
  this.timeout(5000)

  it('test #getAll', async function () {
    const images = await getAll()
    assert.isArray(images)
    assert.isOk(images.length > 0)

    const image = images[0]
    assert.isObject(image)
    assert.hasAllKeys(image, ['images'])

    assert.isArray(image.images)
    assert.isString(image.images[0])
  })

  it('test #getOne', async function () {
    const image = await getOne()
    assert.isArray(image.images)
    assert.isString(image.images[0])
  })
})
