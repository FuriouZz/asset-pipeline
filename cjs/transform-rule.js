"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransformRule = void 0;
const rule_1 = require("./rule");
const path_1 = require("path");
const utils_1 = require("./utils");
const utils_2 = require("./path/utils");
const EXT_REG = /^\./;
exports.CreateTransformRule = rule_1.createRule({
    options() {
        return {
            tag: "default",
            cachebreak: true,
            pre: [],
        };
    },
    methods: {
        name(name) {
            this.options.name = name;
            return this;
        },
        directory(directory) {
            this.options.directory = directory;
            return this;
        },
        baseDirectory(baseDirectory) {
            this.options.baseDirectory = baseDirectory;
            return this;
        },
        relative(relative) {
            this.options.relative = relative;
            return this;
        },
        cachebreak(enable) {
            this.options.cachebreak = enable;
            return this;
        },
        path(path) {
            this.options.pre.push(["path", path]);
            return this;
        },
        extension(extension) {
            this.options.extension = extension;
            return this;
        },
        keepDirectory(enable) {
            this.options.pre.push(["keepDirectory", enable]);
            return this;
        },
        apply(filename, options) {
            if (!this.match(filename)) {
                throw new Error(`Cannot tranform "${filename}"`);
            }
            const _options = Object.assign({ cachebreak: false, saltKey: "none" }, (options || {}));
            const get = (entry) => {
                if (typeof entry === "function") {
                    return entry(filename, options);
                }
                return entry;
            };
            const rule = Object.assign({}, this.options);
            rule.pre.forEach((pre) => {
                switch (pre[0]) {
                    case "path": {
                        const path = get(pre[1]);
                        rule.directory = path_1.dirname(path);
                        const parts = path_1.basename(path).split(".");
                        const name = parts.shift();
                        const extension = parts.join(".");
                        if (name)
                            rule.name = name;
                        if (extension && !rule.extension)
                            rule.extension = `.${extension}`;
                        break;
                    }
                    case "keepDirectory": {
                        const enable = get(pre[1]);
                        if (enable) {
                            delete rule.directory;
                        }
                        else {
                            rule.directory = ".";
                        }
                        break;
                    }
                }
            });
            let output = filename;
            const hash = utils_1.generateHash(output + _options.saltKey);
            const parsed = path_1.parse(output);
            // Fix ext and name
            const parts = parsed.base.split(".");
            const name = parts.shift();
            parsed.name = name;
            parsed.ext = `.${parts.join(".")}`;
            if (typeof rule.directory !== "undefined") {
                parsed.dir = get(rule.directory);
            }
            if (typeof rule.relative !== "undefined") {
                parsed.dir = path_1.relative(get(rule.relative), parsed.dir);
            }
            if (typeof rule.baseDirectory !== "undefined") {
                parsed.dir = path_1.join(get(rule.baseDirectory), parsed.dir);
            }
            if (typeof rule.name !== "undefined") {
                parsed.name = get(rule.name);
            }
            if (_options.cachebreak && typeof rule.cachebreak !== "undefined") {
                if (get(rule.cachebreak)) {
                    parsed.name = `${parsed.name}-${hash}`;
                }
            }
            if (typeof rule.extension !== "undefined") {
                let extension = get(rule.extension);
                if (!EXT_REG.test(extension)) {
                    extension = `.${extension}`;
                }
                parsed.ext = extension;
            }
            parsed.base = parsed.name + parsed.ext;
            output = path_1.format(parsed);
            return {
                path: utils_2.normalize(output, "web"),
                tag: rule.tag,
                priority: rule.priority,
            };
        },
    },
});
