<template>
  <div class="app-container clearfix">

    <div class="config-icon" v-show="!inConfig" @click.prevent="showConfig">
      <config-icon></config-icon>
    </div>

    <button class="btn btn-primary finish-config-button" v-if="inConfig" @click.prevent="saveConfig">Finish</button>

    <div v-show="inConfig">
      <div id="wallpaper" :style="wallpaperStyle"></div>
      <div class="menu-container float-left col-3 p-3">
        <nav class="menu">
          <a class="menu-item" :class="{selected: isMenuActive(collection)}" :key="collection.id" v-for="collection of collections" @click.prevent="selectCollection(collection)">{{ collection.name }}</a>
        </nav>
        <div class="d-flex flex-justify-between">
          <button class="btn">Edit</button>
          <button class="btn btn-primary" @click="prepareAddCollection">Add</button>
        </div>
      </div>
      <div class="gallery-container" @wheel="scrollBarWheel" ref="galleryContainer">
        <div v-for="(image, idx) of images" :key="image" class="thumbnail" :class="isActive(idx)" @click="selectWallpaper(idx)">
          <img :src="image" alt="thumbnail" width="240" height="180">
        </div>
      </div>

    </div>

    <div
      v-show="isAddingCollection"
    >

      <details-dialog
        class="Box Box--overlay d-flex flex-column"
        id="add_collection"
      >
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

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component';
import { Store, ICollection, IImage, CollectionStore, ImageStore, installDefaultCollections, Configuration, IConfiguration } from './lib/store'

const ConfigIcon = require('../../extension/config.svg');
const wallpapersStore = require('../../extension/wallpapers.json')

const textareaExample = [
  'https://i.imgur.com/7Fu38N.png',
  'https://i.imgur.com/nj37z.png',
  'https://i.imgur.com/9k3j8.png'
]

@Component({
  components: {
    ConfigIcon
  }
})
export default class App extends Vue {
  selectedCollectionId = null
  selectedIndex =  0
  selectedFiles =  []
  inConfig = false
  isAddingCollection = false
  config : IConfiguration

  collections: ICollection[] = []
  imageStore: { [key: string]: IImage }

  scrollBarWheel (event) {
    (this.$refs.galleryContainer as Element).scrollLeft -= event.wheelDeltaY / 3
  }

  isActive (index: number) {
    return index === this.selectedIndex ? 'active' : null;
  }

  isMenuActive (collection) {
    return collection.id === this.selectedCollectionId;
  }

  selectWallpaper (index) {
    this.selectedIndex = index;
  }

  selectCollection (collection) {
    if (this.selectedCollectionId !== collection.id) {
      this.selectedIndex = 0;
    }

    this.selectedCollectionId = collection.id;
  }

  prepareAddCollection () {
    // TODO: reseting form

    this.isAddingCollection = true
  }

  showConfig () {
    this.inConfig = true
  }

  saveConfig () {
    Configuration.set('selectedCollectionId', this.selectedCollectionId)

    this.inConfig = false
  }

  collectionFileChange () {
    // this.selectedFiles = this.$refs.collectionFiles.files.map(file => URL.createObjectURL(file));
  }

  async mounted () {
    await installDefaultCollections();

    // load existing collections and images
    this.collections = await CollectionStore.all();
    this.imageStore = await ImageStore.getStore();
    this.config = await Configuration.getAll();

    this.selectedCollectionId = this.config.selectedCollectionId;
  }

  get selectedCollection () {
    return this.collections.find(c => c.id === this.selectedCollectionId);
  }

  get selectedWallpaper () {
    return this.images[this.selectedIndex];
  }

  get wallpaperStyle () {
    return {
      backgroundImage: `url(${this.selectedWallpaper})`
    };
  }

  get images () {
    if (this.selectedCollection) {
      return this.selectedCollection.imageIds.map(imageId => {
        const image = this.imageStore[imageId]
        return image && image.path;
      })
    } else {
      return []
    }
  }

  get textareaExample () {
    return textareaExample.join('\n');
  }
}
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

.config-icon {
  position: absolute;
  right: 1em;
  bottom: 1em;
  opacity: 0.4;
  transition: opacity ease-in-out .3s;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

.finish-config-button {
  position: absolute;
  right: 1em;
  top: 1em;
}
</style>
