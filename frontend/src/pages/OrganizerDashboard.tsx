import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../services/api';
import { type Event } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Navbar } from '../components/layout/Navbar';

const eventSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  venueName: z.string().min(3, 'Informe o local do evento'),
  eventDate: z.string().refine(val => new Date(val) > new Date(), { message: 'A data deve ser no futuro' }),
  capacity: z.coerce.number().min(1, 'A capacidade deve ser maior que zero'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo'),
  seatMapEnabled: z.boolean().default(false),
});

type EventForm = z.infer<typeof eventSchema>;

export function OrganizerDashboard() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventForm>({
    resolver: zodResolver(eventSchema)
  });

  const fetchMyEvents = async () => {
    try {
      setFetching(true);
      const response = await api.get('/events/mine');
      setMyEvents(response.data);
    } catch (err) {
      console.error("Erro ao buscar meus eventos", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const onSubmit = async (data: EventForm) => {
    setLoading(true);
    try {
      // Ajuste de data para ISO caso o backend exija
      const payload = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString()
      };
      await api.post('/events', payload);
      alert('Evento publicado com sucesso!');
      reset();
      fetchMyEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar evento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold mb-4">Criar Novo Evento</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Título do Evento" {...register('title')} error={errors.title?.message} />
              <Input label="Local (Venue)" {...register('venueName')} error={errors.venueName?.message} />
              <Input label="Data e Hora" type="datetime-local" {...register('eventDate')} error={errors.eventDate?.message} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Capacidade" type="number" {...register('capacity')} error={errors.capacity?.message} />
                <Input label="Preço (R$)" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="seatMapEnabled" {...register('seatMapEnabled')} className="h-4 w-4 text-primary-600 rounded" />
                <label htmlFor="seatMapEnabled" className="text-sm font-medium text-gray-700">Modo Mapa de Assentos Numéricos</label>
              </div>

              <Button type="submit" fullWidth isLoading={loading} className="mt-4">
                Publicar Evento
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Meus Eventos Publicados</h2>
          {fetching ? (
            <p>Carregando seus eventos...</p>
          ) : myEvents.length === 0 ? (
            <p className="text-gray-500">Você ainda não publicou nenhum evento.</p>
          ) : (
            <div className="space-y-4">
              {myEvents.map(evt => (
                <Card key={evt.id} className="flex justify-between items-center border-l-4 border-l-primary-500">
                  <div>
                    <h3 className="font-bold text-lg">{evt.title}</h3>
                    <p className="text-gray-500 text-sm">📍 {evt.venueName} | 📅 {new Date(evt.eventDate).toLocaleString('pt-BR')}</p>
                    <p className="text-sm font-medium text-primary-700 mt-1">Ingressos Vendidos: {evt.soldCount} / {evt.capacity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg block">R$ {evt.price.toFixed(2)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}