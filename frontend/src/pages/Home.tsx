import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { type Event } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'DATE_ASC' | 'PRICE_ASC' | 'PRICE_DESC'>('DATE_ASC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await api.get(`/events?search=${search}`);
        setEvents(response.data);
      } catch (error) {
        console.error("Erro ao buscar eventos", error);
      } finally {
        setLoading(false);
      }
    }
    
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (sortBy === 'DATE_ASC') {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }
      if (sortBy === 'PRICE_ASC') {
        return a.price - b.price;
      }
      if (sortBy === 'PRICE_DESC') {
        return b.price - a.price;
      }
      return 0;
    });
  }, [events, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {isAuthenticated && user?.role === 'CLIENTE' && (
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-500">
              Olá, <span className="text-gray-900 font-bold">{(user.name || user.email).split('@')[0]}</span>! Pronto para viver novas emoções?
            </h2>
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Descubra Próximos Eventos</h1>
            <p className="mt-2 text-gray-600">Explore shows, peças e festivais rolando perto de você.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <Input 
                label="" 
                placeholder="Buscar por artistas, shows ou cidades..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto min-w-[220px]">
              <select 
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="DATE_ASC">⏰ Datas mais Próximas</option>
                <option value="PRICE_ASC">💰 Menor Preço</option>
                <option value="PRICE_DESC">💎 Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Buscando os melhores eventos...</div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Nenhum evento encontrado para esta busca.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map(event => (
              <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100" noPadding>
                <div className="h-56 w-full relative bg-gray-200">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary-400">
                      {new Date(event.eventDate).toLocaleDateString('pt-BR')}
                    </p>
                    <h3 className="text-xl font-bold line-clamp-1">{titleFromData(event)}</h3>
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

function titleFromData(event: Event) {
  return event.title || 'Evento Sem Título';
}
