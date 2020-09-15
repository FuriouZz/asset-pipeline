"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transform = void 0;
const path_1 = require("path");
const template_1 = require("lol/js/string/template");
const object_1 = require("lol/js/object");
const minimatch_1 = __importDefault(require("minimatch"));
const path_2 = require("./path");
const TemplateOptions = {
    open: '#{',
    body: '[a-z@$#-_?!]+',
    close: '}'
};
class Transform {
    constructor(type = "file") {
        this.type = type;
        this.rules = [];
    }
    /**
     * Add as transformation applied to the glob pattern
     */
    add(glob, parameters = {}) {
        glob = path_2.normalize(glob, "web");
        const params = parameters = Object.assign({
            glob: glob
        }, parameters);
        params.glob = glob;
        this.rules.push(params);
    }
    /**
     * Shortcut for input/output transformation
     */
    addEntry(input, output, parameters = {}) {
        parameters = Object.assign({
            rename: output,
            keep_path: false
        }, parameters);
        this.add(input, parameters);
    }
    /**
     * Add as transformation applied to the glob pattern
     */
    ignore(glob) {
        glob = path_2.normalize(glob, "web");
        const parameters = {
            glob: glob,
            ignore: true
        };
        this.rules.push(parameters);
    }
    /**
     * Clone the rules
     */
    clone(file) {
        for (let i = 0; i < this.rules.length; i++) {
            const glob = this.rules[i];
            file.rules.push(glob);
        }
        return file;
    }
    /**
     * Look for the first matching rule. If not found, a generic rule is returned.
     */
    matchingRule(path) {
        for (let i = 0, ilen = this.rules.length; i < ilen; i++) {
            const rule = this.rules[i];
            if (path === rule.glob || minimatch_1.default(path, rule.glob)) {
                return rule;
            }
        }
        return { glob: path };
    }
    /**
     * Apply the transformation to the asset and register to the manifest
     */
    transform(pipeline, asset) {
        // Ignore files registered from directory_pipeline or from previous rules
        const masset = pipeline.manifest.get(asset.input);
        if (masset && masset.resolved)
            return;
        const rule = asset.rule || this.matchingRule(asset.input);
        asset.rule = rule;
        pipeline.manifest.add(asset);
        this.tranformOutput(pipeline, asset.input, object_1.clone(rule));
    }
    tranformOutput(pipeline, file, rule) {
        let output = file;
        // Remove path and keep basename only
        if (typeof rule.keep_path === 'boolean' && !rule.keep_path) {
            output = path_1.basename(output);
        }
        // Add base_dir
        if (typeof rule.base_dir === 'string') {
            const base_dir = pipeline.output.join(rule.base_dir, output);
            output = pipeline.output.relative(base_dir.os()).os();
        }
        // Replace dir path if needed
        output = this.resolveDir(pipeline, output);
        let cache = output;
        const hash = pipeline.cache.generateHash(output + pipeline.cache.key);
        let options = {
            rule,
            input: Object.assign({ hash, fullpath: file }, path_1.parse(file)),
            output: Object.assign({ hash, fullpath: output }, path_1.parse(output))
        };
        if (typeof rule.output == 'function') {
            rule.output = output = cache = rule.output(options);
            rule.output = path_2.normalize(rule.output, "web");
        }
        else if (typeof rule.output === 'string') {
            rule.output = output = cache = template_1.template2(rule.output, object_1.flat(options), TemplateOptions);
            rule.output = path_2.normalize(rule.output, "web");
        }
        else if (typeof rule.output === 'object') {
            const parsed = Object.assign(path_1.parse(options.output.fullpath), rule.output);
            if ("ext" in rule.output || "name" in rule.output) {
                parsed.base = `${parsed.name}${parsed.ext}`;
            }
            for (const key of Object.keys(parsed)) {
                parsed[key] = template_1.template2(parsed[key], object_1.flat(options), TemplateOptions);
            }
            rule.output = output = cache = path_1.format(parsed);
            rule.output = path_2.normalize(rule.output, "web");
        }
        options.output = Object.assign({ hash, fullpath: output }, path_1.parse(output));
        if (typeof rule.cache == 'function') {
            rule.cache = cache = rule.cache(options);
            rule.cache = path_2.normalize(rule.cache, "web");
        }
        else if (typeof rule.cache === 'string') {
            rule.cache = cache = template_1.template2(rule.cache, object_1.flat(options), TemplateOptions);
            rule.cache = path_2.normalize(rule.cache, "web");
        }
        else if (typeof rule.cache === 'object') {
            const parsed = Object.assign(path_1.parse(cache), rule.cache);
            if ("ext" in rule.cache || "name" in rule.cache) {
                parsed.base = `${parsed.name}${parsed.ext}`;
            }
            for (const key of Object.keys(parsed)) {
                parsed[key] = template_1.template2(parsed[key], object_1.flat(options), TemplateOptions);
            }
            rule.cache = cache = path_1.format(parsed);
            rule.cache = path_2.normalize(rule.cache, "web");
        }
        else if ((typeof rule.cache == 'boolean' && rule.cache && pipeline.cache.enabled)
            ||
                (typeof rule.cache != 'boolean' && pipeline.cache.enabled)) {
            if (pipeline.cache.type === 'hash') {
                rule.cache = cache = pipeline.cache.hash(output);
                rule.cache = path_2.normalize(cache, "web");
            }
            else if (pipeline.cache.type === 'version' && this.type === 'file') {
                rule.cache = cache = pipeline.cache.version(output);
                rule.cache = path_2.normalize(cache, "web");
            }
        }
        const asset = pipeline.manifest.get(file);
        asset.input = path_2.normalize(asset.input, "web");
        asset.output = path_2.normalize(output, "web");
        asset.cache = path_2.normalize(cache, "web");
        asset.resolved = true;
        asset.tag = typeof rule.tag == 'string' ? rule.tag : 'default';
        asset.rule = rule;
        pipeline.manifest.add(asset);
    }
    resolveDir(pipeline, output) {
        const pathObject = path_1.parse(output);
        let dir = pathObject.dir;
        let d = [];
        dir = path_2.normalize(dir, "web");
        const ds = dir.split('/').filter(part => !!part);
        for (let i = 0; i < ds.length; i++) {
            d.push(ds[i]);
            const dd = d.join('/');
            const ddd = pipeline.getPath(dd);
            if (dd != ddd) {
                d = ddd.split('/');
            }
        }
        pathObject.dir = d.join('/');
        return path_1.format(pathObject);
    }
}
exports.Transform = Transform;
