import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { type Event } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function EventDetails() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);

    useEffect(() => {
        // Busca os dados do evento específico
        async function fetchEvent() {
            try {
                // Chamada Real: const response = await api.get(`/events/${id}`); setEvent(response.data);

                // Mock Temporário:
                setEvent({
                    id: id || '1',
                    title: 'Festival de Rock 2026',
                    venueName: 'Estádio Nacional',
                    eventDate: '2026-10-10T20:00:00Z',
                    capacity: 50000,
                    price: 250.00,
                    soldCount: 49995, // Quase esgotando para testarmos o limite!
                    seatMapEnabled: false,
                    organizerId: 'org1',
                    status: 'PUBLISHED'
                });
            } catch (err) {
                console.error("Evento não encontrado");
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [id]);

    const handleReserve = async () => {
        if (!isAuthenticated) {
            alert("Você precisa fazer login primeiro!");
            navigate('/login');
            return;
        }

        setReserving(true);
        try {
            // Chamada Real pro backend gerar a reserva "PENDING_PAYMENT"
            // const response = await api.post('/reservations', { eventId: id, quantity });
            // navigate(`/checkout/${response.data.id}`);

            // Simulação de transição
            setTimeout(() => {
                alert(`Sucesso! Separamos ${quantity} ingresso(s) para você.`);
                navigate(`/checkout/reserva-mockada-123`); // Vai pra etapa 7 (Pagamento)
            }, 1000);
        } catch (err: any) {
            // Tratamento de concorrência que o backend enviar (ex: 409 Conflict)
            alert(err.response?.data?.message || 'Erro ao reservar. As vagas podem ter esgotado!');
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
                    {/* Banner */}
                    <div className="h-64 bg-gray-800 w-full relative flex items-center justify-center">
                        <h1 className="text-4xl font-bold text-white z-10">{event.title}</h1>
                        <div className="absolute inset-0 bg-black opacity-40"></div>
                    </div>

                    <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Infos do Evento */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações</h2>
                            <div className="space-y-3 text-gray-600">
                                <p>📍 <strong>Local:</strong> {event.venueName}</p>
                                <p>📅 <strong>Data:</strong> {new Date(event.eventDate).toLocaleString('pt-BR')}</p>
                                <p>💰 <strong>Preço:</strong> R$ {event.price.toFixed(2)}</p>
                                <div className="mt-6 inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium border border-primary-100">
                                    Restam apenas {availableSpots} ingressos!
                                </div>
                            </div>
                        </div>

                        {/* Ação de Reserva */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Garanta seu lugar</h3>

                            {availableSpots > 0 ? (
                                <>
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

                                    <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                                        <span>Total a pagar:</span>
                                        <span className="text-xl font-bold text-gray-900">R$ {(event.price * quantity).toFixed(2)}</span>
                                    </div>

                                    <Button fullWidth onClick={handleReserve} isLoading={reserving}>
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