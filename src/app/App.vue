<template>
  <div class="app-container clearfix">
    <div class="menu-container float-left col-3 p-3">
      <nav class="menu" aria-label="Person settings">
        <a class="menu-item selected" href="#url" aria-current="page">Kanahei's Collection 1</a>
        <a class="menu-item" href="#url">Snoopy</a>
        <a class="menu-item" href="#url">Doraemon</a>
        <a class="menu-item" href="#url">???</a>
      </nav>
    </div>
    <div class="gallery-container" @wheel="scrollBarWheel" ref="galleryContainer">
      <div v-for="(image, idx) of images" :key="image" class="thumbnail" :class="isActive(idx)">
        <img :src="image" alt="thumbnail" width="230" height="165">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
const wallpapersStore = require('../../extension/wallpapers.json')

export default Vue.extend({
  data () {
    return {
      images: wallpapersStore.wallpapers.map(w => w.images[1]).slice(0, 20)
    }
  },
  methods: {
    scrollBarWheel (event) {
      this.$refs.galleryContainer.scrollLeft -= event.wheelDeltaY / 3
    },

    isActive (index: number) {
      return index === 0 ? 'active' : null;
    }
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;

  overflow: hidden;
}

.menu-container {
  min-width: 150px;
  max-width: 260px;

  .menu-item {
    text-overflow: ellipsis;
  }
}

.gallery-container {
  position: absolute;
  bottom: 0;
  height: 200px;
  width: 100vw;
  background: rgba(0, 0, 0, 0.548);
  padding: 10px 0 30px;

  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  align-content: center;

  .thumbnail {
    min-width: 230px;
    width: 230px;
    overflow: hidden;
    height: 165px;
    margin: 0 6px;

    &.active {
      border: solid 5px white;
    }

    img {
      user-select: none;
      -webkit-user-select: none;
      -webkit-user-drag: none;
      object-fit: cover;
    }
  }
}
</style>
