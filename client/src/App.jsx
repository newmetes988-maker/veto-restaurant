import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import ReservationForm from './components/ReservationForm';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import QRPage from './pages/QRPage';
import MenuHome from './pages/menu/MenuHome';
import DrinksMenu from './pages/menu/DrinksMenu';
import FoodMenu from './pages/menu/FoodMenu';
import DessertsMenu from './pages/menu/DessertsMenu';
import ProductManager from './pages/admin/ProductManager';
import CategoryManager from './pages/admin/CategoryManager';
import MessageTemplateManager from './pages/admin/MessageTemplateManager';

const CustomerPage = () => (
  <div className="min-h-screen bg-brand-950">
    <Header />
    <main>
      <ReservationForm />
    </main>
    <Footer />
  </div>
);

const AdminPage = ({ user, onLogin, onLogout, loginError, loginLoading, children }) => {
  if (!user) {
    return <AdminLogin onLogin={onLogin} error={loginError} isLoading={loginLoading} />;
  }
  return children ? children : <AdminDashboard user={user} onLogout={onLogout} />;
};

function App() {
  const { user, isLoading, login, logout } = useAuth();
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const data = await login(email, password);
      if (data.status !== 'success') {
        setLoginError(data.message || 'Login failed');
      }
    } catch {
      setLoginError('Network error');
    } finally {
      setLoginLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-900">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route
          path="/admin"
          element={
            <AdminPage
              user={user}
              onLogin={handleLogin}
              onLogout={logout}
              loginError={loginError}
              loginLoading={loginLoading}
            />
          }
        />
        <Route path="/qr/:token" element={<QRPage />} />
        <Route path="/menu" element={<MenuHome />} />
        <Route path="/menu/drinks" element={<DrinksMenu />} />
        <Route path="/menu/food" element={<FoodMenu />} />
        <Route path="/menu/desserts" element={<DessertsMenu />} />
        <Route path="/admin/products" element={<AdminPage user={user} onLogin={handleLogin} onLogout={logout} loginError={loginError} loginLoading={loginLoading}><ProductManager /></AdminPage>} />
        <Route path="/admin/categories" element={<AdminPage user={user} onLogin={handleLogin} onLogout={logout} loginError={loginError} loginLoading={loginLoading}><CategoryManager /></AdminPage>} />
        <Route path="/admin/templates" element={<AdminPage user={user} onLogin={handleLogin} onLogout={logout} loginError={loginError} loginLoading={loginLoading}><MessageTemplateManager /></AdminPage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
