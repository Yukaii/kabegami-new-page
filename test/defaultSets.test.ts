import { firstLoadRandomWallpaper } from '../src/defaultSets'
import { assert } from 'chai'

describe('Test defaultSets', function () {
  it('#firstLoadRandomWallpaper', function () {
    assert.isString(firstLoadRandomWallpaper())
  })
})
