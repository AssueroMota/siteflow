import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlatform } from './PlatformContext';
import CatalogModal from '../components/catalog/CatalogModal';
const CatalogModalContext = createContext(null);
export function CatalogModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const { systems, categories } = usePlatform();
  const location = useLocation();
  const openCatalog = useCallback(() => setOpen(true), []),
    closeCatalog = useCallback(() => setOpen(false), []);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  return (
    <CatalogModalContext.Provider value={{ openCatalog, closeCatalog, catalogOpen: open }}>
      {children}
      {open && <CatalogModal systems={systems} categories={categories} onClose={closeCatalog} />}
    </CatalogModalContext.Provider>
  );
}
export const useCatalogModal = () => useContext(CatalogModalContext);
