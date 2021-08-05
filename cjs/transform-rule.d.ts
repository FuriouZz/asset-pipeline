import { RuleOptions, TransformedPath } from "./types";
declare type AcceptedInput = string | number | boolean;
declare type InputFunction<T extends AcceptedInput> = (filename: string, options?: Partial<RuleOptions>) => T;
declare type Input<T extends AcceptedInput> = T | InputFunction<T>;
export interface TransformRuleOptions {
    name?: Input<string>;
    extension?: Input<string>;
    directory?: Input<string>;
    baseDirectory?: Input<string>;
    relative?: Input<string>;
    cachebreak?: Input<boolean>;
    pre: (["path", Input<string>] | ["keepDirectory", Input<boolean>])[];
}
export declare type TransformRule = ReturnType<typeof CreateTransformRule>;
export declare const CreateTransformRule: (pattern: string) => import("./types").DefaultRule<TransformRuleOptions> & {
    name(name?: string | InputFunction<string> | undefined): any & import("./types").DefaultRule<TransformRuleOptions>;
    directory(directory?: string | InputFunction<string> | undefined): any & import("./types").DefaultRule<TransformRuleOptions>;
    baseDirectory(baseDirectory?: string | InputFunction<string> | undefined): any & import("./types").DefaultRule<TransformRuleOptions>;
    relative(relative?: string | InputFunction<string> | undefined): any & import("./types").DefaultRule<TransformRuleOptions>;
    cachebreak(enable?: boolean | InputFunction<boolean> | undefined): any & import("./types").DefaultRule<TransformRuleOptions>;
    path(path: Input<string>): any & import("./types").DefaultRule<TransformRuleOptions>;
    extension(extension?: string | InputFunction<string> | undefined): any & import("./types").DefaultRule<TransformRuleOptions>;
    keepDirectory(enable: Input<boolean>): any & import("./types").DefaultRule<TransformRuleOptions>;
    apply(filename: string, options?: Partial<RuleOptions> | undefined): TransformedPath;
};
export {};
