import "bootstrap/dist/css/bootstrap.min.css";
import "./conzept_styling.css"; // CONZEPT PATCH

import store, { persistor, wrapper } from "../store";

import { AppProps } from "next/app";
import { CookiesProvider } from "react-cookie";
import { GlobalStyle } from "layout/GlobalStyle";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import React from "react";
import ReactGA from "react-ga";
import { ThemeProvider } from "styled-components";
import { useCurrentTheme } from "hooks/useCurrentTheme";
import usePageView from "hooks/usePageView";
import useReadQuery from "../hooks/useReadQuery";

ReactGA.initialize( "placeholder", { // CONZEPT PATCH
  testMode: !process.env.NEXT_PUBLIC_GA_TRACKING_CODE,
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  const currentTheme = useCurrentTheme();
  usePageView();
  useReadQuery();

  return (
    <CookiesProvider>
      <GlobalStyle />
      <PersistGate loading={null} persistor={persistor}>
        {() => (
          <ThemeProvider theme={currentTheme}>
            <Provider store={store}>
              <Component {...pageProps} />
            </Provider>
          </ThemeProvider>
        )}
      </PersistGate>
    </CookiesProvider>
  );
};

export default wrapper.withRedux(MyApp);
