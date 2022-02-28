import { webpack } from 'next/dist/compiled/webpack/webpack';
export declare const ssrEntries: Map<string, {
    requireFlightManifest: boolean;
}>;
export interface MiddlewareManifest {
    version: 1;
    sortedMiddleware: string[];
    clientInfo: [string, boolean][];
    middleware: {
        [page: string]: {
            env: string[];
            files: string[];
            name: string;
            page: string;
            regexp: string;
        };
    };
}
export default class MiddlewarePlugin {
    dev: boolean;
    hasServerComponents?: boolean;
    constructor({ dev, hasServerComponents, }: {
        dev: boolean;
        hasServerComponents?: boolean;
    });
    createAssets(compilation: any, assets: any, envPerRoute: Map<string, string[]>): void;
    apply(compiler: webpack.Compiler): void;
}
