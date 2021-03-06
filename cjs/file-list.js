"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileList = void 0;
const fs_1 = require("lol/js/node/fs");
const path_1 = require("./path/path");
const PATH = new path_1.PathBuilder("");
class FileList {
    constructor() {
        this.entries = [];
        this.filelist = {
            pending: true,
            include: [],
            exclude: [],
        };
    }
    include(...patterns) {
        for (const pattern of patterns) {
            this._include(path_1.toWebString(pattern));
        }
        return this;
    }
    exclude(...patterns) {
        for (const pattern of patterns) {
            this._exclude(path_1.toWebString(pattern));
        }
        return this;
    }
    shadow(...patterns) {
        for (const pattern of patterns) {
            this._push(path_1.toWebString(pattern));
        }
        return this;
    }
    resolve(force = false) {
        if (force)
            this.filelist.pending = true;
        if (this.filelist.pending) {
            const files = fs_1.fetch(this.filelist.include, this.filelist.exclude);
            for (const file of files) {
                this._push(file);
            }
        }
        return this.entries.slice(0);
    }
    _push(file) {
        const f = PATH.set(file).web();
        if (!this.entries.includes(f)) {
            this.entries.push(f);
        }
    }
    _include(pattern) {
        this.filelist.include.push(PATH.set(pattern).unix());
    }
    _exclude(pattern) {
        this.filelist.exclude.push(PATH.set(pattern).unix());
    }
}
exports.FileList = FileList;
