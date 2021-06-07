import { firstLoadRandomWallpaper } from '../src'

describe('Test defaultSets', function () {
  it('#firstLoadRandomWallpaper', function () {
    expect(typeof firstLoadRandomWallpaper()).toBe('string')
  })
})
