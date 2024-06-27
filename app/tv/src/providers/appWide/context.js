import { createContext } from 'react';

const AppWideContext = createContext({
    state: {},
    actions: {}
});

export default AppWideContext;