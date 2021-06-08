import { getAll, getOne } from '../src'

describe('Test real crawler', function () {
  it('test #getAll', async function () {
    const images = await getAll()
    
    expect(Array.isArray(images)).toBeTruthy()
    expect(images.length).toBeGreaterThan(0)

    const image = images[0]
    
    expect(image).toBeInstanceOf(Object)
    expect(image).toHaveProperty(['images'])

    expect(Array.isArray(image.images))
    expect(typeof image.images[0]).toBe('string')
  }, 30000)

  it('test #getOne', async function () {
    const image = await getOne()

    expect(Array.isArray(image.images)).toBeTruthy()
    expect(typeof image.images[0]).toBe('string')
  })
})
