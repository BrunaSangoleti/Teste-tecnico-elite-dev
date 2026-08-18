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
              <Card key={ticket.id} className={`flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-shadow border-gray-200 ${ticket.status === 'USED' ? 'opacity-70 bg-gray-50' : 'bg-white'}`} noPadding>
                {/* Lateral com QR Code */}
                <div className={`p-5 sm:w-48 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-100 ${ticket.status === 'VALID' ? 'bg-primary-50/30' : 'bg-gray-100'}`}>
                  <img 
                    src={`http://localhost:8081/api/tickets/${ticket.id}/qrcode`} 
                    alt="QR Code do Ingresso" 
                    className={`w-32 h-32 rounded-lg ${ticket.status === 'USED' ? 'grayscale opacity-50' : 'shadow-sm'}`}
                    onError={(e) => {
                      e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrToken || ticket.id}`;
                    }}
                  />
                  <span className={`mt-4 px-3 py-1 text-xs font-bold rounded-full border ${ticket.status === 'VALID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                    {ticket.status === 'VALID' ? 'VÁLIDO' : 'UTILIZADO'}
                  </span>
                  
                  {/* Código Manual para Portaria */}
                  <div className="mt-4 w-full flex flex-col items-center border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 text-center">
                      CÓDIGO MANUAL (PORTARIA)
                    </span>
                    <code className="text-[10px] sm:text-xs font-mono font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-1 rounded w-full text-center break-all select-all">
                      {ticket.id}
                    </code>
                  </div>
                </div>
                
                {/* Detalhes do Evento */}
                <div className="flex flex-col flex-grow">
                  {ticket.imageUrl && (
                    <div className="h-24 w-full bg-gray-200 overflow-hidden relative">
                       <img src={ticket.imageUrl} alt={ticket.eventTitle || 'Evento'} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  )}
                  
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                          {ticket.eventTitle || 'Evento Sem Título'}
                        </h3>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {ticket.eventDate && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-2">⏰</span>
                            <span className="font-medium">{new Date(ticket.eventDate).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        )}
                        {ticket.venueName && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-2">📍</span>
                            <span>{ticket.venueName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400 font-mono">ID: {ticket.id.substring(0,8)}...</p>
                      <a 
                        href={`/ingresso/${ticket.shareToken}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline flex items-center"
                      >
                        Ver ingresso público &rarr;
                      </a>
                    </div>
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