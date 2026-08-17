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
        <div className="bg-primary-600 p-6 text-center text-white">
          <h2 className="text-2xl font-bold">Elite Tickets</h2>
          <p className="text-primary-100 text-sm mt-1">Ingresso Oficial</p>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qrToken || ticket.id}`} 
            alt="QR Code" 
            className="w-48 h-48 mb-6"
          />
          <h3 className="text-xl font-bold text-gray-900 text-center">Acesso Liberado</h3>
          <p className="text-gray-500 mt-2 text-center text-sm">Este é um link público somente-leitura do ingresso.</p>
        </div>
      </Card>
      
      <Link to="/" className="text-gray-400 mt-8 hover:text-white transition-colors">
        Ir para a Home
      </Link>
    </div>
  );
}