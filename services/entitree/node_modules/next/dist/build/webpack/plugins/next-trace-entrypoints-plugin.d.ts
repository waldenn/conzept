import { Span } from '../../../trace';
import type { webpack5 } from 'next/dist/compiled/webpack/webpack';
import { NextConfigComplete } from '../../../server/config-shared';
export declare class TraceEntryPointsPlugin implements webpack5.WebpackPluginInstance {
    private appDir;
    private entryTraces;
    private excludeFiles;
    private esmExternals?;
    private staticImageImports?;
    constructor({ appDir, excludeFiles, esmExternals, staticImageImports, }: {
        appDir: string;
        excludeFiles?: string[];
        staticImageImports: boolean;
        esmExternals?: NextConfigComplete['experimental']['esmExternals'];
    });
    createTraceAssets(compilation: any, assets: any, span: Span): void;
    tapfinishModules(compilation: webpack5.Compilation, traceEntrypointsPluginSpan: Span, doResolve?: (request: string, parent: string, job: import('@vercel/nft/out/node-file-trace').Job, isEsmRequested: boolean) => Promise<string>): void;
    apply(compiler: webpack5.Compiler): void;
}
