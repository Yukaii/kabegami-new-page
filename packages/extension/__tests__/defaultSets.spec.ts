import { firstLoadRandomWallpaper } from '../src/defaultSets'

describe('Test defaultSets', function () {
  it('#firstLoadRandomWallpaper', function () {
    expect(typeof firstLoadRandomWallpaper()).toBe('string')
  })
})
