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
import { GateValidator } from './pages/GateValidator';
// Um componente simples para proteger rotas apenas para quem está logado
function PrivateRoute({ children, allowedRole }: { children: ReactNode, allowedRole?: string }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" />;
  return <>{children}</>;
}

// Impede que o usuário PORTARIA acesse telas de eventos (redireciona para o app dele)
function BlockPortariaRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'PORTARIA') return <Navigate to="/portaria" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<BlockPortariaRoute><Home /></BlockPortariaRoute>} />
          <Route path="/evento/:id" element={<BlockPortariaRoute><EventDetails /></BlockPortariaRoute>} />
          <Route path="/login" element={<Login />} />

          {/* Rota protegida, só ORGANIZADOR pode acessar */}
          <Route path="/organizador/eventos" element={
            <PrivateRoute allowedRole="ORGANIZADOR">
              <OrganizerDashboard />
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