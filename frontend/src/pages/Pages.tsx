import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Event } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Navbar } from '../components/layout/Navbar';

export function Home() {
    const [events, setEvents] = useState<Event[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Busca inicial de eventos publicados
        async function fetchEvents() {
            try {
                // Chamada real para a API:
                // const response = await api.get(`/events?query=${search}`);
                // setEvents(response.data);

                // Mock provisório para testarmos o visual enquanto o back não integra 100%
                setEvents([
                    { id: '1', title: 'Festival de Rock 2026', venueName: 'Estádio Nacional', eventDate: '2026-10-10T20:00:00Z', capacity: 50000, price: 250.00, soldCount: 15000, seatMapEnabled: false, organizerId: 'org1', status: 'PUBLISHED' },
                    { id: '2', title: 'Teatro: O Fantasma', venueName: 'Teatro Municipal', eventDate: '2026-11-05T19:30:00Z', capacity: 500, price: 120.00, soldCount: 480, seatMapEnabled: true, organizerId: 'org2', status: 'PUBLISHED' },
                ]);
            } catch (error) {
                console.error("Erro ao buscar eventos", error);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [search]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Próximos Eventos</h1>
                        <p className="mt-2 text-gray-600">Garanta seu ingresso para as melhores experiências.</p>
                    </div>
                    <div className="w-full sm:w-72">
                        <Input
                            label=""
                            placeholder="Buscar eventos ou cidades..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Carregando eventos...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <Card key={event.id} className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer" noPadding>
                                {/* Imagem Placeholder */}
                                <div className="h-48 bg-gray-200 w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
                                            {new Date(event.eventDate).toLocaleDateString('pt-BR')}
                                        </p>
                                        <h3 className="text-xl font-bold line-clamp-1">{event.title}</h3>
                                    </div>
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div>
                                        <p className="text-gray-600 flex items-center text-sm mb-4">
                                            📍 {event.venueName}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-lg font-bold text-gray-900">
                                            R$ {event.price.toFixed(2).replace('.', ',')}
                                        </span>
                                        <Link to={`/evento/${event.id}`} className="text-primary-600 font-medium hover:text-primary-700 text-sm">
                                            Ver detalhes &rarr;
                                        </Link>
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