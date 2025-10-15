import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import MainLayout from './components/MainLayout';

// Supondo que estas páginas existam
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyCode } from './pages/VerifyCode';
import { ResetPassword } from './pages/ResetPassword';
import Movies from './pages/Movies';
import Dashboard from './pages/Dashboard';
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas que usam o layout principal (com navbar) */}
          <Route element={<MainLayout />}>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />

            {/* Rotas de Autenticação (apenas para não logados) */}
            <Route element={<AuthRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-code" element={<VerifyCode />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Rotas Protegidas (apenas para logados) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;