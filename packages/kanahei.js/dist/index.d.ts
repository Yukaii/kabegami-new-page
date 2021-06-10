import 'cross-fetch/polyfill';
interface IWallpaper {
    images: string[];
}
export declare function getOne(): Promise<IWallpaper>;
export declare function getAll(): Promise<IWallpaper[]>;
export {};
