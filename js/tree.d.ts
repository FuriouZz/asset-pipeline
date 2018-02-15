import { AssetPipeline, AssetItem } from "./asset-pipeline";
export interface TreeInterface {
    path: string;
    files: string[];
    subdirectories: {
        [key: string]: TreeInterface;
    };
}
export declare class Tree {
    pipeline: AssetPipeline;
    _tree: TreeInterface;
    constructor(pipeline: AssetPipeline);
    readonly manifest: {
        ASSET_KEY: string | number;
        DATE: Date;
        LOAD_PATH: string;
        DIST_PATH: string;
        ASSETS: {
            [key: string]: AssetItem;
        };
    };
    update(): void;
    resolve(path: string): TreeInterface;
    buildPath(path: string): string;
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getPath(path: string, fromPath?: string): string;
    /**
     * @param {string} path - Path required
     * @param {string?} fromPath - File which request the path (must be relative to ABSOLUTE_LOAD_PATH)
     */
    getUrl(path: string, fromPath?: string): string;
    view(): string;
}
