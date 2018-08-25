<template>
  <div class="app-container clearfix">

    <notification-center></notification-center>

    <div class="config-icon" v-show="!inConfig && showConfigIcon" @click.prevent="showConfig" ref="configIcon">
      <config-icon :iconName="configIconName"></config-icon>
      <context-menu class="right-menu"
        :target="contextMenuTarget"
        :show="contextMenuVisible"
        @update:show="(show) => contextMenuVisible = show">
        <a v-for="icon in availableIcons" :key="icon" @click.stop.prevent="changeConfigIcon(icon)">
          <config-icon :iconName="icon"></config-icon>
        </a>
      </context-menu>
    </div>

    <button class="btn btn-primary finish-config-button" v-if="inConfig" @click.prevent="saveConfig">{{ $t('finish') }}</button>

    <div v-show="inConfig" class="config-ui-container">
      <div id="wallpaper" :style="wallpaperStyle"></div>
      <div class="menu-container float-left col-3 p-3">
        <nav class="menu">
          <a class="menu-item" :class="{selected: isMenuActive(collection)}" :key="collection.id" v-for="collection of collections" @click.prevent="selectCollection(collection)">
            {{ collection.name }}
            <img src="block.png" v-if="canDeleteCollection(collection)" class="delete-collection-icon" @click="deleteCollection(collection)" alt="">
          </a>
        </nav>
        <div class="d-flex flex-justify-end">
          <button class="btn btn-primary" @click="prepareAddCollection">{{ $t('add') }}</button>
        </div>
      </div>
      <div class="gallery-container" @wheel="scrollBarWheel" ref="galleryContainer">
        <div v-for="(image, idx) of images" :key="image" class="thumbnail" :class="isActive(idx)" @click="selectWallpaper(idx)">
          <img :src="image" alt="thumbnail" width="240" height="180">
        </div>
      </div>

    </div>

    <div v-show="isAddingCollection" class="dialog-container" >
      <div
        class="Box Box--overlay d-flex flex-column"
        id="add_collection"
      >
      <form ref="collectionForm" @change="validateCollectionForm">
        <div class="Box-header">
          <h3 class="Box-title">{{ $t('addNewCollection') }}</h3>
        </div>
        <div class="overflow-auto">
          <div class="Box-body overflow-auto">
            <dl class="form-group">
              <dt>
                <label for="collectionFormName">{{ $t('collectionName') }}</label>
              </dt>
              <dd>
                <input class="form-control" v-model="collectionFormName">
              </dd>
            </dl>

            <dl class="form-group">
              <dt>
                <label for="collection-images">{{ $t('addImages') }}</label>
              </dt>
              <p>
                <dt>
                  {{ $t('selectFolder') }}
                </dt>
                <input
                  class="form-control"
                  type="file"
                  id="filepicker"
                  name="fileList"
                  webkitdirectory multiple
                  ref="collectionFormFilesInput"
                  @change="collectionFileChange" />
                <dt>
                  <div v-show="isCollectionFormUploading" class="py-2 bg-green collection-upload-progressbar" :style="collectionProgressbarStyle"></div>
                </dt>
                <dt>
                  {{ $t('pasteUrls') }}
                </dt>
              <p>
              <dd>
                <textarea v-model="collectionFormImageUrls" class="form-control" name="collectionFormImageUrls" cols="30" rows="5" :placeholder="textareaExample"></textarea>
              </dd>
            </dl>
          </div>
        </div>
        <div class="Box-footer">
          <button type="button" class="btn" @click="cancelCollectionForm">{{ $t('cancel') }}</button>
          <button type="button" class="btn btn-primary float-right" @click="submitCollectionForm" :disabled="!isCollectionFormReady">{{ collectionFormSubmitText }}</button>
        </div>
      </form>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component';
import { Store, ICollection, IImage, CollectionStore, ImageStore, installDefaultCollections, Configuration, IConfiguration } from './lib/store'
import { mapSeries } from 'p-iteration'
import ImageUploader from './lib/ImageUploader';
import ConfigIcon, { availableIcons as icons, availableIcons } from './components/ConfigIcon.vue'
import NotificationCenter, { notify } from './components/NotificationCenter.vue'

import { component as ContextMenu } from '@xunlei/vue-context-menu'

const textareaExample = [
  'https://i.imgur.com/7Fu38N.png',
  'https://i.imgur.com/nj37z.png',
  'https://i.imgur.com/9k3j8.png'
]

@Component({
  components: {
    ConfigIcon,
    ContextMenu,
    NotificationCenter
  }
})
export default class App extends Vue {
  selectedCollectionId = null
  selectedIndex =  0
  selectedFiles =  []
  inConfig = false
  isAddingCollection = false
  config : IConfiguration

  collectionFormImageUrls = ''
  collectionFormName = ''
  collectionFormFiles: FileList
  collectionUploadProgress = 0
  collectionUploadImageUrls: string[] = []
  isCollectionFormUploading = false
  isCollectionFormValid = false
  isSubmittingCollectionForm = false

  contextMenuTarget = null
  contextMenuVisible = false
  availableIcons = icons
  configIconName = 'usagi'
  showConfigIcon = false

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

  async deleteCollection(collection) {
    if (!collection.protected) {
      await CollectionStore.delete(collection);
      await this.reloadStore()
    }
  }

  prepareAddCollection () {
    // TODO: reseting form

    this.isAddingCollection = true
  }

  showConfig () {
    this.inConfig = true
  }

  async saveConfig () {
    await Configuration.set('selectedCollectionId', this.selectedCollectionId)

    this.inConfig = false
  }

  async collectionFileChange () {
    this.collectionFormFiles = (this.$refs.collectionFormFilesInput as HTMLInputElement).files

    if (!this.validateInputFiles()) {
      this.resetCollectionFiles();

      notify({ type: 'error', message: this.$t('onlyImagesUpload') as string })
    } else {
      this.isCollectionFormUploading = true

      try {
        this.collectionUploadImageUrls = await ImageUploader.upload(this.collectionFormFiles, (progress) => {
          this.collectionUploadProgress = progress
        })
      } catch (error) {
        const message = this.$t('imageUploadFailed') as string
        console.error(error)
        notify({ type: 'error', message })
      }

      this.isCollectionFormUploading = false
    }
  }

  validateInputFiles () {
    for (let i = 0; i < this.collectionFormFiles.length; i++) {
      const file = this.collectionFormFiles[i]

      const fileName = file.name
      const idxDot = fileName.lastIndexOf('.') + 1;
      const fileExt = fileName.substr(idxDot, fileName.length).toLowerCase();

      const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

      if (validExtensions.includes(fileExt)) {
        return true
      } else {
        return false
      }
    }
  }

  cancelCollectionForm () {
    this.resetCollectionFiles()

    ImageUploader.cancel();
    this.isCollectionFormUploading = false

    this.collectionFormImageUrls = ''
    this.collectionFormName = undefined

    this.isAddingCollection = false
  }

  async submitCollectionForm () {
    this.isSubmittingCollectionForm = true

    const imageIds = this.collectionUploadImageUrls.length !== 0 ?
        await this.saveUrlsToToImageStore(this.collectionUploadImageUrls) :
        await this.processRawImageUrls(this.collectionFormImageUrls);

    await CollectionStore.create({
      name: this.collectionFormName,
      imageIds
    })

    await this.reloadStore();

    this.cancelCollectionForm();

    this.isSubmittingCollectionForm = false
  }

  async processRawImageUrls (imageUrls: string) {
    return await this.saveUrlsToToImageStore(imageUrls.match(/https?:\/\/[^\s]+?\.(png|gif|jpg|jpeg)/g))
  }

  async saveUrlsToToImageStore (urls: string[]) {
    return await mapSeries(urls, async url => {
      const image = await ImageStore.create({
        path: url
      })
      return (image[Object.keys(image)[0]] as IImage).id
    })
  }

  resetCollectionFiles () {
    // reset input files
    (this.$refs.collectionForm as any).reset();

    this.collectionUploadImageUrls = [];
  }

  async mounted () {
    this.contextMenuTarget = this.$refs.configIcon

    await installDefaultCollections();
    await this.reloadStore();

    this.showConfigIcon = true
  }

  async reloadStore () {
    // load existing collections and images
    this.collections = await CollectionStore.all();
    this.imageStore = await ImageStore.getStore();
    this.config = await Configuration.getAll();

    this.selectedCollectionId = this.config.selectedCollectionId;
    this.configIconName = this.config.configIconName
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

  get collectionProgressbarStyle () {
    if (this.isCollectionFormUploading) {
      return {
        width: `${this.collectionUploadProgress}%`
      }
    } else {
      return null
    }
  }

  get collectionFormSubmitText () {
    if (this.isCollectionFormUploading) {
      return this.$t('uploading')
    } else {
      return this.$t('create')
    }
  }

  get isCollectionFormReady () {
    return !this.isCollectionFormUploading &&
           !this.isSubmittingCollectionForm &&
           this.isCollectionFormValid;
  }

  canDeleteCollection (collection) {
    return !collection.protected && collection.id !== this.selectedCollectionId
  }

  validateCollectionForm () {
    this.isCollectionFormValid = (typeof this.collectionFormName !== 'undefined') &&
        (!!this.collectionFormImageUrls || !!this.collectionUploadImageUrls) // any field is ok
  }

  async changeConfigIcon (iconName) {
    this.configIconName = iconName
    await Configuration.set('configIconName', iconName)
    this.contextMenuVisible = false
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

  .config-ui-container {
    background-color: white;
  }
}

.menu-container {
  min-width: 150px;
  max-width: 260px;

  z-index: 99;

  .menu-item {
    user-select: none;
    text-overflow: ellipsis;

    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      .delete-collection-icon {
        display: inline;
      }
    }

    .delete-collection-icon {
      height: 21px;
      display: none;
      cursor: pointer;
    }
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
}

.dialog-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
}

textarea[name="collectionFormImageUrls"] {
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

.collection-upload-progressbar {
  transition: width ease-in-out .3s;
  margin-top: 10px;
  margin-right: 6px;
}

.right-menu {
  position: fixed;
  background: #fff;
  border-radius: 3px;
  z-index: 999;
  display: none;
  transform: translateX(-100%) translateY(-100%);
  box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
  border-radius: 1px;

  a {
    width: 75px;
    height: 73px;
    line-height: 73px;
    text-align: center;
    display: block;
    color: #1a1a1a;
    padding: 2px;

    &:hover {
      background: #eee;
      color: #fff;
      background: #ff8383;
    }
  }
}

</style>
