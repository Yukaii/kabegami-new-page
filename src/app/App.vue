<template>
  <div class="app-container clearfix">
    <div id="wallpaper" :style="wallpaperStyle"></div>
    <div class="menu-container float-left col-3 p-3">
      <nav class="menu">
        <a class="menu-item" :class="{selected: isMenuActive(collection)}" :key="collection.id" v-for="collection of collections" @click.prevent="selectCollection(collection)">{{ collection.name }}</a>
        <div class="menu-item d-flex flex-justify-end">
          <button class="btn btn-primary">Add</button>
        </div>
      </nav>
    </div>
    <div class="gallery-container" @wheel="scrollBarWheel" ref="galleryContainer">
      <div v-for="(image, idx) of images" :key="image" class="thumbnail" :class="isActive(idx)" @click="selectWallpaper(idx)">
        <img :src="image" alt="thumbnail" width="240" height="180">
      </div>
    </div>

    <details-dialog class="Box Box--overlay d-flex flex-column anim-fade-in fast" id="add_collection">
      <div class="Box-header">
        <h3 class="Box-title">Add new collection</h3>
      </div>
      <div class="overflow-auto">
        <div class="Box-body overflow-auto">
          <p>
            You can select a folder:
            <input
              class="form-control"
              type="file"
              id="filepicker"
              name="fileList"
              webkitdirectory multiple
              ref="collectionFiles"
              @change="collectionFileChange" />
          <p>
          <p>{{ JSON.stringify(selectedFiles) }}</p>
          <p>or paste image urls below:</p>
          <dl class="form-group">
            <dd>
              <textarea class="form-control" name="inputImageUrls" cols="30" rows="5" :placeholder="textareaExample"></textarea>
            </dd>
          </dl>
        </div>
      </div>
      <div class="Box-footer">
        <button type="button" class="btn" autofocus data-close-dialog>Cancel</button>
        <button type="button" class="btn btn-primary float-right" autofocus data-close-dialog>Create</button>
      </div>
    </details-dialog>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
const wallpapersStore = require('../../extension/wallpapers.json')

const textareaExample = [
  'https://i.imgur.com/7Fu38N.png',
  'https://i.imgur.com/nj37z.png',
  'https://i.imgur.com/9k3j8.png'
]

const collectionStore = {
  0: {
    name: 'カナヘイ',
    images: wallpapersStore.wallpapers.map(w => w.images[1]).slice(0, 20)
  },
  1: {
    name: 'Snoopy',
    images: [
      'https://pre00.deviantart.net/5b5d/th/pre/f/2018/063/a/5/snoopy_wallpaper_by_turbomixelgamer-dc4yt4t.png',
      'http://kb4images.com/images/snoopy-wallpaper/36870860-snoopy-wallpaper.jpg',
      'https://wallpaper.wiki/wp-content/uploads/2017/05/Snoopy-And-Charlie-Brown-The-Peanuts-Movie-Wallpaper.jpg'
    ]
  }
}

const collectionIds = [0, 1]

export default Vue.extend({
  data () {
    return {
      selectedCollectionId: collectionIds[0],
      selectedIndex: 0,
      selectedFiles: []
    }
  },
  methods: {
    scrollBarWheel (event) {
      this.$refs.galleryContainer.scrollLeft -= event.wheelDeltaY / 3
    },

    isActive (index: number) {
      return index === this.selectedIndex ? 'active' : null;
    },

    isMenuActive (collection) {
      return collection.id === this.selectedCollectionId;
    },

    selectWallpaper (index) {
      this.selectedIndex = index;
    },

    selectCollection (collection) {
      if (this.selectedCollectionId !== collection.id) {
        this.selectedIndex = 0;
      }

      this.selectedCollectionId = collection.id;
    },

    collectionFileChange () {
      // this.selectedFiles = this.$refs.collectionFiles.files.map(file => URL.createObjectURL(file));
    }
  },
  computed: {
    selectedWallpaper () {
      return this.images[this.selectedIndex];
    },

    wallpaperStyle () {
      return {
        backgroundImage: `url(${this.selectedWallpaper})`
      };
    },

    images () {
      return collectionStore[this.selectedCollectionId].images;
    },

    collections () {
      return collectionIds.map(id => ({...collectionStore[id], id }));
    },

    textareaExample () {
      return textareaExample.join('\n');
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

  z-index: 99;

  .menu-item {
    user-select: none;
    text-overflow: ellipsis;
  }
}

#wallpaper {
  width: 100%;
  height: 100%;
  transition: background .5s ease-in-out;
  position: absolute;
  background-size: cover;
  background-position: center;
  z-index: -1;
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
    min-width: 240px;
    width: 240px;
    overflow: hidden;
    height: 180px;
    margin: 0 6px;

    transition: all 300ms;
    border: solid 0px white;

    &:hover {
      cursor: pointer;
    }

    &.active, &:hover {
      border: solid 10px white;
    }

    img {
      user-select: none;
      -webkit-user-select: none;
      -webkit-user-drag: none;
      object-fit: cover;
    }
  }
}

#add_collection {
  width: 480px;
  left: calc(50vw - 240px);
  top: calc(50vh - 170px);
  position: fixed;
}

textarea[name="inputImageUrls"] {
  height: 100px;
  min-height: 100px;
}
</style>
