import { PathBuilder, PathOrString } from "./path/path";
import { URLBuilder } from "./path/url";
import { ResolvedPath, TransformResult } from "./types";
export declare class Resolver {
    host: URLBuilder;
    output: PathBuilder;
    protected _cwd: PathBuilder;
    paths: TransformResult[];
    aliases: PathBuilder[];
    set(paths: TransformResult[]): void;
    alias(...paths: PathOrString[]): this;
    resolve(path: string, tag?: string): ResolvedPath[];
    getTransformedPath(path: string, tag?: string): import("./types").TransformedPath;
    getPath(path: string, tag?: string): string;
    getUrl(path: string, tag?: string): string;
    getOutputPath(path: string, tag?: string): string;
    findInputPath(outputPath: PathOrString): TransformResult;
    filter(predicate?: (value: TransformResult, index: number, array: TransformResult[]) => boolean): TransformResult[];
    match(pattern: string): TransformResult[];
}
