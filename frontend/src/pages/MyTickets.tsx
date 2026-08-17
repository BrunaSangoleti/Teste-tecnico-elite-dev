import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { type Ticket } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Visitante';

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await api.get('/tickets/mine');
        setTickets(response.data);
      } catch (err) {
        console.error("Erro ao carregar ingressos", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ingressos de {firstName} 🎫</h1>
          <p className="mt-2 text-gray-500 text-lg">Aqui estão seus acessos garantidos. Apresente o QR Code na entrada do evento.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">Buscando na sua carteira digital...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500 text-lg font-medium">Sua carteira de ingressos está vazia.</p>
            <p className="text-gray-400 text-sm mt-2 mb-6">Que tal descobrir o seu próximo show inesquecível?</p>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm">
              Explorar Eventos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <Card key={ticket.id} className={`flex flex-col sm:flex-row overflow-hidden ${ticket.status === 'USED' ? 'opacity-60' : ''}`} noPadding>
                <div className="bg-white p-6 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col items-center justify-center min-w-[200px]">
                  {/* Agora buscamos o QR Code real vindo do nosso backend em PNG */}
                  <img 
                    src={`http://localhost:8081/api/tickets/${ticket.id}/qrcode`} 
                    alt="QR Code do Ingresso" 
                    className={`w-32 h-32 ${ticket.status === 'USED' ? 'grayscale' : ''}`}
                    onError={(e) => {
                      // Caso dê erro ao carregar a imagem ou precise do token, recai pro gerador externo
                      e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrToken || ticket.id}`;
                    }}
                  />
                  <span className={`mt-4 px-3 py-1 text-xs font-bold rounded-full ${ticket.status === 'VALID' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {ticket.status === 'VALID' ? 'VÁLIDO' : 'UTILIZADO'}
                  </span>
                </div>
                
                <div className="p-6 flex flex-col justify-between w-full">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Ingresso #{ticket.id.substring(0,8)}</h3>
                    <p className="text-sm text-gray-500 mt-1">Evento: {ticket.eventId}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Link de Compartilhamento:</p>
                    <a 
                      href={`/ingresso/${ticket.shareToken}`} 
                      target="_blank" 
                      className="text-sm text-primary-600 truncate block hover:underline"
                    >
                      Ver ingresso público
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}