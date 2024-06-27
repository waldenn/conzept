import { useState } from 'react';
import AppWideContext from './context';

const AppWideProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  const value = {
    state: { channels, countries, categories, showSplashScreen },
    actions: { setChannels, setCountries, setCategories, setShowSplashScreen },
  };
  return (
    <AppWideContext.Provider value={value}>
      {children}
    </AppWideContext.Provider>
  )
}

export default AppWideProvider;