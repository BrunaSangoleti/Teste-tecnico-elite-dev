import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { OrganizerDashboard } from './pages/OrganizerDashboard';

// Um componente simples para proteger rotas apenas para quem está logado
function PrivateRoute({ children, allowedRole }: { children: ReactNode, allowedRole?: string }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rota protegida, só ORGANIZADOR pode acessar */}
          <Route path="/organizador/eventos" element={
            <PrivateRoute allowedRole="ORGANIZADOR">
              <OrganizerDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}