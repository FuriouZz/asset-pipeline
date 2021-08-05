import { PathOrString } from "./path/path";
import { TransformRule } from "./transform-rule";
import { RuleOptions, TransformResult } from "./types";
export declare class Transformer {
    saltKey: string;
    cachebreak: boolean;
    rules: TransformRule[];
    results: TransformResult[];
    add(pattern: PathOrString): import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions> & {
        name(name?: string | ((filename: string, options?: Partial<RuleOptions> | undefined) => string) | undefined): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        directory(directory?: string | ((filename: string, options?: Partial<RuleOptions> | undefined) => string) | undefined): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        baseDirectory(baseDirectory?: string | ((filename: string, options?: Partial<RuleOptions> | undefined) => string) | undefined): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        relative(relative?: string | ((filename: string, options?: Partial<RuleOptions> | undefined) => string) | undefined): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        cachebreak(enable?: boolean | ((filename: string, options?: Partial<RuleOptions> | undefined) => boolean) | undefined): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        path(path: string | ((filename: string, options?: Partial<RuleOptions> | undefined) => string)): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        extension(extension?: string | ((filename: string, options?: Partial<RuleOptions> | undefined) => string) | undefined): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        keepDirectory(enable: boolean | ((filename: string, options?: Partial<RuleOptions> | undefined) => boolean)): any & import("./types").DefaultRule<import("./transform-rule").TransformRuleOptions>;
        apply(filename: string, options?: Partial<RuleOptions> | undefined): import("./types").TransformedPath;
    };
    delete(pattern: PathOrString): void;
    match(filename: PathOrString): boolean;
    transform(files: string[]): TransformResult[];
}
