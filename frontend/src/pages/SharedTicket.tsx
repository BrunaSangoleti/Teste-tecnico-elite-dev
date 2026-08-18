import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { type Ticket } from '../types';
import { Card } from '../components/ui/Card';

export function SharedTicket() {
  const { shareToken } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    async function fetchShared() {
      try {
        const response = await api.get(`/tickets/shared/${shareToken}`);
        setTicket(response.data);
      } catch (err) {
        console.error("Ingresso compartilhado não encontrado.");
      }
    }
    fetchShared();
  }, [shareToken]);

  if (!ticket) return <div className="text-center p-20 text-white">Ingresso não encontrado ou link inválido.</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <Card noPadding className="w-full max-w-sm overflow-hidden bg-white shadow-2xl">
        <div className="bg-primary-600 p-6 text-center text-white relative">
          {ticket.imageUrl && (
            <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${ticket.imageUrl})` }}></div>
          )}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">{ticket.eventTitle || 'Elite Tickets'}</h2>
            <p className="text-primary-100 text-sm mt-1">Ingresso Oficial Público</p>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center border-b border-gray-100 border-dashed">
          <img 
            src={`http://localhost:8081/api/tickets/${ticket.id}/qrcode`} 
            alt="QR Code do Ingresso" 
            className={`w-48 h-48 mb-6 ${ticket.status === 'USED' ? 'grayscale opacity-50' : ''}`}
            onError={(e) => {
              e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qrToken || ticket.id}`;
            }}
          />
          <h3 className="text-xl font-bold text-gray-900 text-center">
            {ticket.status === 'VALID' ? 'Acesso Válido' : 'Ingresso Utilizado'}
          </h3>
          <p className="text-gray-500 mt-2 text-center text-sm">Este é um link público de visualização do ingresso.</p>
          
          <div className="mt-6 w-full max-w-[250px] bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">CÓDIGO MANUAL (PORTARIA)</p>
            <code className="text-xs font-mono font-bold text-gray-800 break-all select-all">
              {ticket.id}
            </code>
          </div>
        </div>

        <div className="bg-gray-50 p-6">
          <div className="space-y-3">
            {ticket.eventDate && (
              <div className="flex items-start">
                <span className="text-gray-400 mr-3">⏰</span>
                <p className="text-sm text-gray-800 font-medium">
                  {new Date(ticket.eventDate).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
            {ticket.venueName && (
              <div className="flex items-start">
                <span className="text-gray-400 mr-3">📍</span>
                <p className="text-sm text-gray-800 font-medium">{ticket.venueName}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Link to="/" className="text-gray-400 mt-8 hover:text-white transition-colors">
        Ir para a Home
      </Link>
    </div>
  );
}