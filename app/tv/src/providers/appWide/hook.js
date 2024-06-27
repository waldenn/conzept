import { useContext } from 'react';
import AppWideContext from './context';

const useAppWide = () => {
  return useContext(AppWideContext);
}

export default useAppWide;