import { createRule } from "./rule";
import { basename, dirname, format, join, parse, relative } from "path";
import { generateHash } from "./utils";
import { normalize } from "./path/utils";
import { RuleOptions, TransformedPath } from "./types";

type AcceptedInput = string | number | boolean;
type InputFunction<T extends AcceptedInput> = (
  filename: string,
  options?: Partial<RuleOptions>
) => T;
type Input<T extends AcceptedInput> = T | InputFunction<T>;

export interface TransformRuleOptions {
  name?: Input<string>;
  extension?: Input<string>;
  directory?: Input<string>;
  baseDirectory?: Input<string>;
  relative?: Input<string>;
  cachebreak?: Input<boolean>;
  pre: (["path", Input<string>] | ["keepDirectory", Input<boolean>])[];
}

export type TransformRule = ReturnType<typeof CreateTransformRule>;

const EXT_REG = /^\./;

export const CreateTransformRule = createRule({
  options() {
    return <TransformRuleOptions>{
      tag: "default",
      cachebreak: true,
      pre: [],
    };
  },

  methods: {
    name(name?: Input<string>) {
      this.options.name = name;
      return this;
    },

    directory(directory?: Input<string>) {
      this.options.directory = directory;
      return this;
    },

    baseDirectory(baseDirectory?: Input<string>) {
      this.options.baseDirectory = baseDirectory;
      return this;
    },

    relative(relative?: Input<string>) {
      this.options.relative = relative;
      return this;
    },

    cachebreak(enable?: Input<boolean>) {
      this.options.cachebreak = enable;
      return this;
    },

    path(path: Input<string>) {
      this.options.pre.push(["path", path]);
      return this;
    },

    extension(extension?: Input<string>) {
      this.options.extension = extension;
      return this;
    },

    keepDirectory(enable: Input<boolean>) {
      this.options.pre.push(["keepDirectory", enable]);
      return this;
    },

    apply(filename: string, options?: Partial<RuleOptions>): TransformedPath {
      if (!this.match(filename)) {
        throw new Error(`Cannot tranform "${filename}"`);
      }

      const _options: RuleOptions = {
        cachebreak: false,
        saltKey: "none",
        ...(options || {}),
      };

      const get = <T extends AcceptedInput>(entry: Input<T>) => {
        if (typeof entry === "function") {
          return entry(filename, options);
        }

        return entry;
      };

      const rule = { ...this.options };

      rule.pre.forEach((pre) => {
        switch (pre[0]) {
          case "path": {
            const path = get(pre[1]);
            rule.directory = dirname(path);
            const parts = basename(path).split(".");
            const name = parts.shift();
            const extension = parts.join(".");
            if (name) rule.name = name;
            if (extension && !rule.extension) rule.extension = `.${extension}`;
            break;
          }

          case "keepDirectory": {
            const enable = get(pre[1]);
            if (enable) {
              delete rule.directory;
            } else {
              rule.directory = ".";
            }
            break;
          }
        }
      });

      let output = filename;

      const hash = generateHash(output + _options.saltKey);
      const parsed = parse(output);

      // Fix ext and name
      const parts = parsed.base.split(".");
      const name = parts.shift()!;
      parsed.name = name;
      parsed.ext = `.${parts.join(".")}`;

      if (typeof rule.directory !== "undefined") {
        parsed.dir = get(rule.directory);
      }

      if (typeof rule.relative !== "undefined") {
        parsed.dir = relative(get(rule.relative), parsed.dir);
      }

      if (typeof rule.baseDirectory !== "undefined") {
        parsed.dir = join(get(rule.baseDirectory), parsed.dir);
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

      output = format(parsed);

      return {
        path: normalize(output, "web"),
        tag: rule.tag,
        priority: rule.priority,
      };
    },
  },
});
