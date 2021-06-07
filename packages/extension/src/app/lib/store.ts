import { uuid } from './utils';
import * as localforge from 'localforage'
import { mapSeries, forEachSeries } from 'p-iteration';
import { defaultCollections } from '@kabegami-new-page/default-sets';

interface IModel extends Object {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface IImage extends IModel {
  path: string
}

export interface ICollection extends IModel {
  name: string;
  protected?: boolean;
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

  async exists (data: Partial<T>) {
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

  async find (filter: T): Promise<T> {
    const entries = await this.all();

    return entries.find(ent => {
      return Object.entries(filter).reduce((acc, [k, v]) => {
        return acc && ent[k] === v
      }, true)
    })
  }

  async update (data: Partial<T>): Promise<T | boolean> {
    const dataStorage = await this.getStorage();
    if (!this.exists(data)) {
      return false;
    }

    // casting data.id to string
    const id : string = data.id

    dataStorage[id] = Object.assign({}, dataStorage[id], data)

    await storage.setItem(this.key, dataStorage);

    return dataStorage[id]
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
  configIconName: string
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
      // Update existing default sets
      const images = await ImageStore.all();
      const collection = collections.find(c => c.name === defaultCollection.name)
      const existingImages = collection.imageIds.map(id => images.find(image => image.id === id)).map(i => i.path)
      const imagesToAdd = defaultCollection.images.filter(path => !existingImages.includes(path))
      const imageStores = await mapSeries(imagesToAdd, async path => await ImageStore.create({ path: path }));

      const imageIds = imageStores.map(i => i[Object.keys(i)[0]].id);

      await CollectionStore.update({ id: collection.id, imageIds: [
        ...imageIds,
        ...collection.imageIds
      ] })
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
