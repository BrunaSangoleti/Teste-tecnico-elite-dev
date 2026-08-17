import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateEvent } from './pages/CreateEvent';
import { EventDetails } from './pages/EventDetails';
import { Checkout } from './pages/Checkout';
import { MyTickets } from './pages/MyTickets';
import { SharedTicket } from './pages/SharedTicket';
import { GateValidator } from './pages/GateValidator';
// Um componente simples para proteger rotas apenas para quem está logado
function PrivateRoute({ children, allowedRole }: { children: ReactNode, allowedRole?: string }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" />;
  return <>{children}</>;
}

// Impede que usuários com roles restritas (PORTARIA, ORGANIZADOR) acessem a área de clientes
function BlockRestrictedRolesRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'PORTARIA') return <Navigate to="/portaria" />;
  if (user?.role === 'ORGANIZADOR') return <Navigate to="/organizador/eventos" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<BlockRestrictedRolesRoute><Home /></BlockRestrictedRolesRoute>} />
          <Route path="/evento/:id" element={<BlockRestrictedRolesRoute><EventDetails /></BlockRestrictedRolesRoute>} />
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas para ORGANIZADOR */}
          <Route path="/organizador/eventos" element={
            <PrivateRoute allowedRole="ORGANIZADOR">
              <OrganizerDashboard />
            </PrivateRoute>
          } />
          <Route path="/organizador/novo-evento" element={
            <PrivateRoute allowedRole="ORGANIZADOR">
              <CreateEvent />
            </PrivateRoute>
          } />

          {/* Rota protegida, exige estar logado para pagar */}
          <Route path="/checkout/:reservationId" element={
            <PrivateRoute allowedRole="CLIENTE">
              <Checkout />
            </PrivateRoute>
          } />
          {/* Rota Privada: Meus Ingressos (Apenas clientes logados) */}
          <Route path="/meus-ingressos" element={
            <PrivateRoute allowedRole="CLIENTE">
              <MyTickets />
            </PrivateRoute>
          } />
          {/* Rota Protegida da Portaria */}
          <Route path="/portaria" element={
            <PrivateRoute allowedRole="PORTARIA">
              <GateValidator />
            </PrivateRoute>
          } />

          {/* Rota Pública: Compartilhamento de Ingresso (Não exige login) */}
          <Route path="/ingresso/:shareToken" element={<SharedTicket />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}