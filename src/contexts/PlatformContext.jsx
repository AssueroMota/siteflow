import { createContext, useContext, useEffect, useState } from 'react';
import { initialOffer, initialSystems, categories as defaultCategories } from '../data/catalog';
import { api, apiEnabled } from '../services/api';
const PlatformContext = createContext(null);
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};
export function PlatformProvider({ children }) {
  const [systems, setSystems] = useState(() =>
    apiEnabled ? [] : read('siteflow.systems', initialSystems),
  );
  const [offer, setOffer] = useState(() =>
    apiEnabled ? initialOffer : read('siteflow.offer', initialOffer),
  );
  const [categories, setCategories] = useState(() =>
    read('siteflow.categories', defaultCategories),
  );
  const [testimonials, setTestimonials] = useState(() =>
    apiEnabled ? [] : read('siteflow.testimonials', []),
  );
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(apiEnabled),
    [error, setError] = useState('');
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!apiEnabled) return;
    Promise.all([api('/catalog'), api('/auth/me')])
      .then(([catalog, auth]) => {
        setSystems(catalog.systems);
        setOffer(catalog.offer);
        setCategories(catalog.categories);
        setUser(auth.user);
        setTestimonials(catalog.testimonials || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!apiEnabled) {
      try {
        localStorage.setItem('siteflow.systems', JSON.stringify(systems));
        localStorage.setItem('siteflow.offer', JSON.stringify(offer));
        localStorage.setItem('siteflow.categories', JSON.stringify(categories));
        localStorage.setItem('siteflow.testimonials', JSON.stringify(testimonials));
      } catch {
        setToast('Armazenamento local cheio. Use uma imagem menor para salvar a demonstração.');
      }
    }
  }, [systems, offer, categories, testimonials]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function saveSystem(value) {
    const saved = apiEnabled
      ? await api(`/admin/systems/${value.id}`, { method: 'PUT', body: JSON.stringify(value) })
      : value;
    setSystems((items) => [...items.filter((s) => s.id !== saved.id), saved]);
    setToast('Sistema salvo com sucesso.');
  }
  async function deleteSystem(id) {
    if (apiEnabled) await api(`/admin/systems/${id}`, { method: 'DELETE' });
    setSystems((items) => items.filter((s) => s.id !== id));
    setToast('Sistema removido.');
  }
  async function saveOffer(value) {
    const saved = apiEnabled
      ? await api('/admin/offer', { method: 'PUT', body: JSON.stringify(value) })
      : value;
    setOffer(saved);
    setToast('Oferta atualizada.');
  }
  async function saveCategories(value) {
    if (apiEnabled)
      await api('/admin/categories', {
        method: 'PUT',
        body: JSON.stringify({ categories: value }),
      });
    setCategories(value);
    setToast('Categorias atualizadas.');
  }
  async function login(email, password, name) {
    if (apiEnabled) {
      const data = await api(name ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      if (data.user) {
        setUser(data.user);
        const catalog = await api('/catalog');
        setSystems(catalog.systems);
        setTestimonials(catalog.testimonials || []);
      }
      return data;
    } else {
      setUser({ id: 'demo', name: name || 'Visitante', email, role: 'customer', demo: true });
      return {};
    }
  }
  async function saveTestimonials(items) {
    const data = apiEnabled
      ? await api('/admin/testimonials', {
          method: 'PUT',
          body: JSON.stringify({ testimonials: items }),
        })
      : { testimonials: items };
    setTestimonials(data.testimonials);
    setToast('Depoimentos atualizados.');
  }
  async function logout() {
    if (apiEnabled) await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }
  return (
    <PlatformContext.Provider
      value={{
        systems,
        offer,
        categories,
        user,
        loading,
        error,
        toast,
        setToast,
        saveSystem,
        deleteSystem,
        saveOffer,
        saveCategories,
        testimonials,
        saveTestimonials,
        login,
        logout,
        demo: !apiEnabled,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}
export const usePlatform = () => useContext(PlatformContext);
