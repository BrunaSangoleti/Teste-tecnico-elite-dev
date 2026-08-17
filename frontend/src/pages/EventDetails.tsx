import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { type Event } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Seat {
  id: string;
  row: string;
  number: number;
  sector: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
}

export function EventDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const response = await api.get(`/events/${id}`);
        const eventData = response.data;
        setEvent(eventData);

        if (eventData.seatMapEnabled) {
          const seatRes = await api.get(`/events/${id}/seats`);
          setSeats(seatRes.data);
        }
      } catch (err) {
        console.error("Erro ao carregar evento", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [id]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      alert("Você precisa fazer login primeiro!");
      navigate('/login');
      return;
    }

    if (user?.role === 'ORGANIZADOR') {
      alert("Organizadores não podem reservar eventos.");
      return;
    }
    if (user?.role === 'PORTARIA') {
      alert("Portaria não pode reservar eventos. Você deve apenas validar na entrada.");
      return;
    }

    if (event?.seatMapEnabled && !selectedSeat) {
      alert("Por favor, selecione um assento antes de continuar.");
      return;
    }

    setReserving(true);
    try {
      const payload = event?.seatMapEnabled 
        ? { eventId: id, seatIds: [selectedSeat] }
        : { eventId: id, quantity };

      const response = await api.post('/reservations', payload);
      navigate(`/checkout/${response.data.id}`, { 
        state: { 
          totalAmount: response.data.totalAmount, 
          quantity: response.data.quantity 
        } 
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao reservar. Vaga(s) não disponível(eis)!');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <div className="text-center p-20">Carregando detalhes...</div>;
  if (!event) return <div className="text-center p-20">Evento não encontrado.</div>;

  const availableSpots = event.capacity - event.soldCount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <Card noPadding className="overflow-hidden">
          <div className="h-64 bg-gray-800 w-full relative flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white z-10">{event.title}</h1>
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informações</h2>
              <div className="space-y-3 text-gray-600">
                <p>📍 <strong>Local:</strong> {event.venueName}</p>
                <p>📅 <strong>Data:</strong> {new Date(event.eventDate).toLocaleString('pt-BR')}</p>
                <p>💰 <strong>Preço:</strong> R$ {event.price.toFixed(2)}</p>
                <div className="mt-6 inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium border border-primary-100">
                  {event.seatMapEnabled ? 'Escolha seu assento no mapa.' : `Restam apenas ${availableSpots} ingressos!`}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Garanta seu lugar</h3>
              
              {user?.role === 'ORGANIZADOR' || user?.role === 'PORTARIA' ? (
                <div className="text-center text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="font-bold">Acesso restrito</p>
                  <p className="text-sm mt-1">Sua conta ({user.role}) não permite fazer reservas. Entre como CLIENTE.</p>
                </div>
              ) : availableSpots > 0 || event.seatMapEnabled ? (
                <>
                  {event.seatMapEnabled ? (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Assento (Setor - Fila/Número)</label>
                      <select 
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-primary-500 focus:border-primary-500"
                        value={selectedSeat || ''}
                        onChange={e => setSelectedSeat(e.target.value)}
                      >
                        <option value="">-- Escolha --</option>
                        {seats.map(seat => (
                          <option key={seat.id} value={seat.id} disabled={seat.status !== 'AVAILABLE'}>
                            {seat.sector} - Fileira {seat.row} / N {seat.number} {seat.status !== 'AVAILABLE' ? '(Indisponível)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200"
                      >-</button>
                      <span className="text-2xl font-bold">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(availableSpots, quantity + 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200"
                      >+</button>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                    <span>Total a pagar:</span>
                    <span className="text-xl font-bold text-gray-900">
                      R$ {(event.price * (event.seatMapEnabled ? (selectedSeat ? 1 : 0) : quantity)).toFixed(2)}
                    </span>
                  </div>

                  <Button fullWidth onClick={handleReserve} isLoading={reserving} disabled={event.seatMapEnabled && !selectedSeat}>
                    Reservar Agora
                  </Button>
                </>
              ) : (
                <div className="text-center text-red-500 font-bold text-xl py-4">
                  ESGOTADO
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}