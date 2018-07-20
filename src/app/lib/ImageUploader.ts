import axios, { Canceler } from 'axios';
import EventEmitter from 'events';
import { map } from 'p-iteration'

const CancelToken = axios.CancelToken

const imgurClientIds = (process.env.IMGUR_CLIENT_IDS || '').split(',')

// https://neighborhood999.github.io/2018/04/17/use-blob-and-file-web-api-create-upload-image-preview-immediately/
function getFileBase64Encode(blob: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default class ImageUploader {
  private static progressMap = new Map<string, number>()
  private static cancelationMap = new Map<string, Canceler>()
  private static uploadedRecord = new Map<string, string>()

  private static emitter = new EventEmitter();

  static async upload (files: FileList, callback: (overallProgress: number) => any) {
    // cancel current upload task
    this.cancel();

    this.emitter.on('progressUpdated', callback);

    const images = await map(Array.from(files), async file => {
      const id = this.getFileIdentifer(file)
      const existingImage = this.uploadedRecord.get(id)
      if (typeof this.progressMap.get(id) === 'undefined' && typeof existingImage === 'undefined') {
        return await this.uploadImage(file)
      } else {
        return existingImage
      }
    })

    this.emitter.removeListener('progressUpdated', callback);

    return images;
  }

  private static async uploadImage (file: File) {
    const base64Image = await getFileBase64Encode(file)
    const base64Part = base64Image.split('base64,')[1]
    const base64Ext = base64Image.match(/\/(.+);base64/)[1]

    const id = this.getFileIdentifer(file);

    const clientId = imgurClientIds[Math.floor(Math.random() * imgurClientIds.length)]

    const response = await axios.post('https://api.imgur.com/3/image', {
      image: base64Part,
      type: base64Ext,
      name: file.name,
    }, {
      headers: {
        Authorization: `Client-ID ${clientId}`
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total )
        this.progressMap.set(id, percentCompleted)
        this.bumpProgress()
      },
      cancelToken: new CancelToken(c => this.cancelationMap.set(id, c))
    })

    this.progressMap.delete(id);
    this.cancelationMap.delete(id);

    const { data: { link } } = response.data;

    // save record to memory
    this.uploadedRecord.set(id, link);

    return link;
  }

  static getFileIdentifer (file: File) {
    const { name, webkitRelativePath, lastModified } = file;
    return `${name}/${webkitRelativePath}/${lastModified}`
  }

  private static bumpProgress ( ) {
    this.emitter.emit('progressUpdated', this.calculateOverallProgress())
  }

  private static calculateOverallProgress (): number {
    const totalProgress = Array.from(this.progressMap.values()).reduce((a, b) => a + b, 0);
    const size = this.progressMap.size;
    return Math.round(totalProgress / size);
  }

  static getStatus () {

  }

  /**
   * cancel all working uploading tasks
   */
  static cancel () {
    this.cancelationMap.forEach(c => c())
  }
}
