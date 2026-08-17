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

  if (loading) return <div className="text-center p-20 text-gray-500 font-medium">Carregando detalhes do evento...</div>;
  if (!event) return <div className="text-center p-20 text-red-500 font-medium">Evento não encontrado.</div>;

  const availableSpots = event.capacity - event.soldCount;
  const noSeatsConfigured = event.seatMapEnabled && seats.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <Card noPadding className="overflow-hidden shadow-lg border border-gray-200">
          <div className="h-72 w-full relative flex items-end p-8 bg-gray-900">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
            <h1 className="text-4xl md:text-5xl font-black text-white z-10 drop-shadow-md">{event.title}</h1>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-wide">Informações do Show</h2>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center gap-3">
                  <span className="text-2xl">📍</span> 
                  <span><strong>Local:</strong> {event.venueName}</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">📅</span> 
                  <span><strong>Data:</strong> {new Date(event.eventDate).toLocaleString('pt-BR')}</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-2xl">💎</span> 
                  <span><strong>Preço do Ingresso:</strong> R$ {event.price.toFixed(2).replace('.', ',')}</span>
                </p>
                <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <p className="text-primary-800 text-sm font-medium">
                    {event.seatMapEnabled 
                      ? 'Este evento possui lugares marcados. Escolha seu assento exato para garantir a melhor visão!'
                      : `Restam apenas ${availableSpots} ingressos para este lote. Não fique de fora!`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Garanta sua entrada</h3>
              
              {user?.role === 'ORGANIZADOR' || user?.role === 'PORTARIA' ? (
                <div className="text-center text-orange-700 p-4 border border-orange-200 rounded-xl bg-orange-50">
                  <p className="font-bold">Acesso restrito</p>
                  <p className="text-sm mt-1">Contas gerenciais não podem reservar ingressos. Entre com uma conta de Cliente.</p>
                </div>
              ) : availableSpots > 0 || event.seatMapEnabled ? (
                <>
                  {event.seatMapEnabled ? (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Selecione o Assento Desejado</label>
                      {noSeatsConfigured ? (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
                          Atenção: O mapa de assentos ainda não foi liberado pela organização.
                        </div>
                      ) : (
                        <select 
                          className="w-full h-12 border-gray-300 rounded-xl shadow-sm px-4 border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-gray-50 text-gray-900"
                          value={selectedSeat || ''}
                          onChange={e => setSelectedSeat(e.target.value)}
                        >
                          <option value="">-- Escolha um assento --</option>
                          {seats.map(seat => (
                            <option key={seat.id} value={seat.id} disabled={seat.status !== 'AVAILABLE'}>
                              {seat.sector} - Fila {seat.row} / Poltrona {seat.number} {seat.status !== 'AVAILABLE' ? '(Indisponível)' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {!selectedSeat && !noSeatsConfigured && (
                        <p className="text-xs text-orange-600 font-medium mt-2">
                          * É obrigatório selecionar um assento para prosseguir com a compra.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Quantidade de Ingressos</label>
                      <div className="flex items-center justify-center space-x-6">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors text-xl font-medium text-gray-600"
                        >-</button>
                        <span className="text-3xl font-black text-gray-900 w-8 text-center">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(Math.min(availableSpots, quantity + 1))}
                          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors text-xl font-medium text-gray-600"
                        >+</button>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-4 text-center">
                        Você pode selecionar até {availableSpots} ingressos nesta compra.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total a pagar</span>
                    <span className="text-2xl font-black text-primary-600">
                      R$ {(event.price * (event.seatMapEnabled ? (selectedSeat ? 1 : 0) : quantity)).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <Button 
                    fullWidth 
                    className="h-14 text-lg shadow-md"
                    onClick={handleReserve} 
                    isLoading={reserving} 
                    disabled={(event.seatMapEnabled && !selectedSeat) || noSeatsConfigured}
                  >
                    Confirmar Reserva
                  </Button>
                </>
              ) : (
                <div className="text-center text-red-600 font-black text-2xl py-8 bg-red-50 rounded-xl border border-red-200">
                  INGRESSOS ESGOTADOS
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}