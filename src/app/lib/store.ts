import { uuid } from './utils';
import * as localforge from 'localforage'
import { mapSeries, forEachSeries } from 'p-iteration';

const kanaheiWallpapers = require('../../../extension/wallpapers.json')

interface IModel extends Object {
  id?: string;
  protected?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface IImage extends IModel {
  path: string
}

export interface ICollection extends IModel {
  name: string;
  imageIds: Array<string>;
}

type ModelStorage<T> = { [key: string]: T} | {};

const storage = localforge

export class Store<T extends IModel> {
  constructor (private key: string) {  }

  public static factory<U extends IModel> (k: string) {
    return new Store<U>(k);
  }

  private async getStorage (): Promise<ModelStorage<T>> {
    const str = await storage.getItem(this.key)
    return str || {};
  }

  getStore () {
    return this.getStorage();
  }

  async all (): Promise<T[]> {
    const dataStorage = await this.getStorage();
    const dataIds = Object.keys(dataStorage);

    return dataIds.map(id => dataStorage[id]);
  }

  async exists (data: T) {
    const dataStorage = await this.getStorage();
    const dataIds = Object.keys(dataStorage);

    return data.id in dataIds;
  }

  async create (data: T): Promise<ModelStorage<T>> {
    const dataStorage = await this.getStorage();
    const timestamp = Date.now();
    const id = uuid()
    const storageToAdd: {[id: string]: T} = {
      [id]: Object.assign({}, data, {
        id,
        createdAt: timestamp,
        updatedAt: timestamp
      })
    }

    await storage.setItem(this.key, {
      ...dataStorage,
      ...storageToAdd
    });

    return storageToAdd;
  }

  async destroy (data: T) {
    const dataStorage = await this.getStorage();
    if (!this.exists(data)) {
      return false;
    }

    delete dataStorage[data.id];

    return await storage.setItem(this.key, dataStorage);
  }

  async delete (data: T) {
    const dataStorage = await this.getStorage();
    if (!this.exists(data)) {
      throw new TypeError('Not Exists');
    }

    delete dataStorage[data.id];

    return await storage.setItem(this.key, dataStorage);
  }
}

export const CollectionStore = Store.factory<ICollection>('collections');
export const ImageStore = Store.factory<IImage>('images');

export interface IConfiguration {
  selectedCollectionId: string;
}

export class Configuration {
  private static storePrefix = 'config'

  static getAll (): Promise<IConfiguration | undefined> {
    return storage.getItem(this.storePrefix);
  }

  static async set (key: keyof IConfiguration, value: any) {
    const config = await this.getAll();

    await storage.setItem(this.storePrefix, {
      ...config,
      [key]: value
    })

    return await this.getAll();
  }

  static async get (key: keyof IConfiguration) {
    return await this.getAll()[key];
  }
}

type DefaultCollection = { name: string, images: string[] }

const defaultCollections: DefaultCollection[] = [{
    name: 'カナヘイ',
    images: kanaheiWallpapers.wallpapers.map(w => w.images[w.images.length - 1])
  }
]

/**
 * Store default collections
 */
export async function installDefaultCollections () {
  const collections = await CollectionStore.all();

  await forEachSeries(defaultCollections, async defaultCollection => {
    // default collection name not exist
    if (!collections.map(c => c.name).includes(defaultCollection.name)) {

      const imageStores = await mapSeries(defaultCollection.images, async path => await ImageStore.create({ path: path }));

      const imageIds = imageStores.map(i => i[Object.keys(i)[0]].id);

      return await CollectionStore.create({
        name: defaultCollection.name,
        protected: true,
        imageIds
      });
    } else {
      // TODO: update new default sets
      // this can be done after auto enabling auto extension build
    }
  });

  if (collections.length === 0) {
    // pre-select default collection
    const newCollections = await CollectionStore.all()
    await Configuration.set('selectedCollectionId', newCollections[0].id)
  } else {
    const config = await Configuration.getAll();
    if (!(config && config.selectedCollectionId)) {
      await Configuration.set('selectedCollectionId', collections[0].id)
    }
  }
}
