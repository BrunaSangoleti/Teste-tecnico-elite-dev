import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { EventDetails } from './pages/EventDetails';
import { Checkout } from './pages/Checkout';
import { MyTickets } from './pages/MyTickets';
import { SharedTicket } from './pages/SharedTicket';
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
          <Route path="/evento/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />

          {/* Rota protegida, só ORGANIZADOR pode acessar */}
          <Route path="/organizador/eventos" element={
            <PrivateRoute allowedRole="ORGANIZADOR">
              <OrganizerDashboard />
            </PrivateRoute>
          } />

          {/* Rota protegida, exige estar logado para pagar */}
          <Route path="/checkout/:reservationId" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
          {/* Rota Privada: Meus Ingressos (Apenas clientes logados) */}
          <Route path="/meus-ingressos" element={
            <PrivateRoute>
              <MyTickets />
            </PrivateRoute>
          } />

          {/* Rota Pública: Compartilhamento de Ingresso (Não exige login) */}
          <Route path="/ingresso/:shareToken" element={<SharedTicket />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}