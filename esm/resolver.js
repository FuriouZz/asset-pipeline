import { PathBuilder, toPath, toWebString } from "./path/path";
import { URLBuilder } from "./path/url";
import { normalize } from "./path/utils";
import minimatch from "minimatch";
const OUTSIDE_REG = /^\.\./;
export class Resolver {
    constructor() {
        this.host = new URLBuilder("/");
        this.output = new PathBuilder("public");
        this._cwd = new PathBuilder(process.cwd());
        this.paths = [];
        this.aliases = [];
    }
    set(paths) {
        this.paths = paths.sort((a, b) => a[1].priority < b[1].priority ? -1 : 1);
    }
    alias(path) {
        this.aliases.push(toPath(path));
        return this;
    }
    resolve(path, tag = "default") {
        path = normalize(path, "web");
        const original = path;
        const extra = path.match(/\#|\?/);
        let parameters = '';
        if (extra) {
            parameters = extra[0] + path.split(extra[0])[1];
            path = path.split(extra[0])[0];
        }
        const paths = [];
        for (const [filename, transformed] of this.paths) {
            if (path === filename && transformed.tag === tag) {
                paths.push({
                    transformed: transformed,
                    parameters
                });
            }
        }
        if (paths.length === 0 && !OUTSIDE_REG.test(path)) {
            for (const alias of this.aliases) {
                const p = alias.join(path).web();
                for (const [filename, transformed] of this.paths) {
                    if (p === filename && transformed.tag === tag) {
                        paths.push({
                            transformed: transformed,
                            parameters
                        });
                    }
                }
            }
        }
        if (paths.length === 0) {
            throw new Error(`Could not resolve "${original}"`);
        }
        return paths.reverse();
    }
    getTransformedPath(path, tag) {
        const paths = this.resolve(path, tag);
        return paths[0].transformed;
    }
    getPath(path, tag) {
        const resolved = this.resolve(path, tag)[0];
        path = resolved.transformed.path + resolved.parameters;
        return this.host.pathname.join(path).web();
    }
    getUrl(path, tag) {
        const resolved = this.resolve(path, tag)[0];
        path = resolved.transformed.path + resolved.parameters;
        return this.host.join(path).toString();
    }
    getOutputPath(path, tag) {
        const resolved = this.resolve(path, tag)[0];
        const _path = this._cwd.join(this.output, this.host.pathname, resolved.transformed.path);
        return this._cwd.relative(_path).web();
    }
    findInputPath(outputPath) {
        let _outpath = toWebString(outputPath);
        if (_outpath[0] === "/") {
            _outpath = _outpath.slice(1);
        }
        const transformed = this.paths.find(([input, result]) => (result.path === _outpath));
        if (!transformed) {
            throw new Error(`Cannot find input for "${outputPath}"`);
        }
        return transformed;
    }
    filter(predicate) {
        if (!predicate)
            return this.paths.slice(0);
        return this.paths.filter(predicate);
    }
    match(pattern) {
        return this.filter(([filename, transformed]) => (minimatch(filename, pattern)));
    }
}
