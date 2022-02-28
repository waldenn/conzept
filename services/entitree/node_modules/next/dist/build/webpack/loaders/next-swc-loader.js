"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = swcLoader;
var _loaderUtils = require("next/dist/compiled/loader-utils");
var _swc = require("../../swc");
const nextDistPath = /(next[\\/]dist[\\/]shared[\\/]lib)|(next[\\/]dist[\\/]client)|(next[\\/]dist[\\/]pages)/;
function getSWCOptions({ isTypeScript , isServer , development , isPageFile , pagesDir , isNextDist , hasReactRefresh , isCommonJS ,  }) {
    const jsc = {
        parser: {
            syntax: isTypeScript ? 'typescript' : 'ecmascript',
            dynamicImport: true,
            [isTypeScript ? 'tsx' : 'jsx']: true
        },
        transform: {
            react: {
                runtime: 'automatic',
                pragma: 'React.createElement',
                pragmaFrag: 'React.Fragment',
                throwIfNamespace: true,
                development: development,
                useBuiltins: true,
                refresh: hasReactRefresh
            },
            optimizer: {
                simplify: false,
                globals: {
                    typeofs: {
                        window: isServer ? 'undefined' : 'object'
                    }
                }
            }
        }
    };
    if (isServer) {
        return {
            jsc,
            // Next.js dist intentionally does not have type: commonjs on server compilation
            ...isCommonJS ? {
                module: {
                    type: 'commonjs'
                }
            } : {
            },
            // Disables getStaticProps/getServerSideProps tree shaking on the server compilation for pages
            disableNextSsg: true,
            disablePageConfig: true,
            isDevelopment: development,
            pagesDir,
            isPageFile,
            env: {
                targets: {
                    // Targets the current version of Node.js
                    node: process.versions.node
                }
            }
        };
    } else {
        // Matches default @babel/preset-env behavior
        jsc.target = 'es5';
        return {
            // Ensure Next.js internals are output as commonjs modules
            ...isNextDist || isCommonJS ? {
                module: {
                    type: 'commonjs'
                }
            } : {
            },
            disableNextSsg: !isPageFile,
            isDevelopment: development,
            pagesDir,
            isPageFile,
            jsc
        };
    }
}
async function loaderTransform(parentTrace, source, inputSourceMap) {
    // Make the loader async
    const filename = this.resourcePath;
    const isTypeScript = filename.endsWith('.ts') || filename.endsWith('.tsx');
    let loaderOptions = (0, _loaderUtils).getOptions(this) || {
    };
    const { isServer , pagesDir , hasReactRefresh  } = loaderOptions;
    const isPageFile = filename.startsWith(pagesDir);
    const isNextDist = nextDistPath.test(filename);
    const isCommonJS = source.indexOf('module.exports') !== -1;
    const swcOptions = getSWCOptions({
        pagesDir,
        isTypeScript,
        isServer: isServer,
        isPageFile,
        development: this.mode === 'development',
        isNextDist,
        isCommonJS,
        hasReactRefresh
    });
    const programmaticOptions = {
        ...swcOptions,
        filename,
        inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : undefined,
        // Set the default sourcemap behavior based on Webpack's mapping flag,
        sourceMaps: this.sourceMap,
        inlineSourcesContent: this.sourceMap,
        // Ensure that Webpack will get a full absolute path in the sourcemap
        // so that it can properly map the module back to its internal cached
        // modules.
        sourceFileName: filename
    };
    if (!programmaticOptions.inputSourceMap) {
        delete programmaticOptions.inputSourceMap;
    }
    // auto detect development mode
    if (this.mode && programmaticOptions.jsc && programmaticOptions.jsc.transform && programmaticOptions.jsc.transform.react && !Object.prototype.hasOwnProperty.call(programmaticOptions.jsc.transform.react, 'development')) {
        programmaticOptions.jsc.transform.react.development = this.mode === 'development';
    }
    const swcSpan = parentTrace.traceChild('next-swc-transform');
    return swcSpan.traceAsyncFn(()=>(0, _swc).transform(source, programmaticOptions).then((output)=>{
            return [
                output.code,
                output.map ? JSON.parse(output.map) : undefined
            ];
        })
    );
}
function swcLoader(inputSource, inputSourceMap) {
    const loaderSpan = this.currentTraceSpan.traceChild('next-swc-loader');
    const callback = this.async();
    loaderSpan.traceAsyncFn(()=>loaderTransform.call(this, loaderSpan, inputSource, inputSourceMap)
    ).then(([transformedSource, outputSourceMap])=>{
        callback(null, transformedSource, outputSourceMap || inputSourceMap);
    }, (err)=>{
        callback(err);
    });
}

//# sourceMappingURL=next-swc-loader.js.map