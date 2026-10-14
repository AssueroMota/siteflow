import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import Details from '../pages/Details';
import Demo from '../pages/Demo';
import Pricing from '../pages/Pricing';
import Request from '../pages/Request';
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import Admin from '../pages/Admin';
import Terms from '../pages/Terms';
import NotFound from '../pages/NotFound';
import VerifyEmail from '../pages/VerifyEmail';
import Credits from '../pages/Credits';
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="catalogo/:id" element={<Details />} />
        <Route path="demo/:id" element={<Demo />} />
        <Route path="mensalidade" element={<Pricing />} />
        <Route path="solicitar" element={<Request />} />
        <Route path="entrar" element={<Auth />} />
        <Route path="confirmar-email" element={<VerifyEmail />} />
        <Route path="painel" element={<Dashboard />} />
        <Route path="admin" element={<Admin />} />
        <Route path="termos" element={<Terms />} />
        <Route path="creditos" element={<Credits />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
