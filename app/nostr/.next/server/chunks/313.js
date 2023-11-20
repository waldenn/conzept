exports.id = 313;
exports.ids = [313];
exports.modules = {

/***/ 4672:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 4249, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 4564, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 885, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 772, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 8262, 23))

/***/ }),

/***/ 6110:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 146));
Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 8033))

/***/ }),

/***/ 146:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Navbar)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1621);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* __next_internal_client_entry_do_not_use__ default auto */ 

function Navbar() {
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "navbar bg-primary text-primary-content sticky top-0 z-20",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "flex-1",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                    href: "/",
                    className: "btn btn-ghost normal-case text-xl",
                    children: "nos.today"
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "flex-none",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                    href: "/about",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                        className: "btn btn-ghost",
                        children: "About"
                    })
                })
            })
        ]
    });
}


/***/ }),

/***/ 8033:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  App: () => (/* binding */ App),
  AppProvider: () => (/* binding */ AppProvider),
  useApp: () => (/* binding */ useApp)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: ./node_modules/nostr-mux/dist/index.js + 7 modules
var dist = __webpack_require__(1780);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(8038);
;// CONCATENATED MODULE: ./src/lib/config.ts
const searchRelays = "wss://search.nos.today,wss://relay.nostr.band,wss://relay.noswhere.com"?.split(",") || 0;
const regularRelays = "wss://relay.damus.io,wss://nos.lol"?.split(",") || 0;
const relays = [
    ...searchRelays,
    ...regularRelays
];

;// CONCATENATED MODULE: ./src/lib/App.tsx
/* __next_internal_client_entry_do_not_use__ App,useApp,AppProvider auto */ 



const mux = new dist/* Mux */.vh();
const aps = new dist/* AutoProfileSubscriber */.wU({
    parser: dist/* parseGenericProfile */.up,
    autoEvict: false,
    collectPubkeyFromEvent: (e, relayURL)=>{
        return relayURL && (e.kind === 1 || e.kind === 42) ? [
            e.pubkey
        ] : [];
    }
});
mux.installPlugin(aps);
const App = /*#__PURE__*/ (0,react_.createContext)({
    mux,
    aps,
    currentTime: new Date()
});
function useApp() {
    return (0,react_.useContext)(App);
}
function AppProvider({ children }) {
    const [currentTime, setCurrentTime] = (0,react_.useState)(new Date());
    (0,react_.useEffect)(()=>{
        const timer = setInterval(()=>{
            setCurrentTime(new Date());
        }, 10000);
        return ()=>{
            clearInterval(timer);
        };
    }, []);
    (0,react_.useEffect)(()=>{
        for (const url of relays){
            mux.addRelay(new dist/* Relay */.ZD(url));
        }
    }, []);
    const ctx = {
        mux,
        aps,
        currentTime
    };
    return /*#__PURE__*/ jsx_runtime_.jsx(App.Provider, {
        value: ctx,
        children: children
    });
}


/***/ }),

/***/ 6939:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ RootLayout),
  metadata: () => (/* binding */ metadata)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: ./node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js
var module_proxy = __webpack_require__(7814);
;// CONCATENATED MODULE: ./src/lib/App.tsx

const proxy = (0,module_proxy.createProxy)(String.raw`/home/jama/dev/conzept/app/nostr-search/src/lib/App.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;

const e0 = proxy["App"];

const e1 = proxy["useApp"];

const e2 = proxy["AppProvider"];

// EXTERNAL MODULE: ./src/app/globals.css
var globals = __webpack_require__(5553);
;// CONCATENATED MODULE: ./src/app/Navbar.tsx

const Navbar_proxy = (0,module_proxy.createProxy)(String.raw`/home/jama/dev/conzept/app/nostr-search/src/app/Navbar.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule: Navbar_esModule, $$typeof: Navbar_$$typeof } = Navbar_proxy;
const Navbar_default_ = Navbar_proxy.default;


/* harmony default export */ const Navbar = (Navbar_default_);
;// CONCATENATED MODULE: ./src/app/layout.tsx




const metadata = {
    title: "nos.today",
    description: "nos.today"
};
function RootLayout({ children }) {
    return /*#__PURE__*/ jsx_runtime_.jsx("html", {
        children: /*#__PURE__*/ jsx_runtime_.jsx(e2, {
            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("body", {
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx(Navbar, {}),
                    children
                ]
            })
        })
    });
}


/***/ }),

/***/ 5553:
/***/ (() => {



/***/ })

};
;