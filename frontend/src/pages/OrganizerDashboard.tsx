import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../services/api';
import { type Event } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const editSchema = z.object({
  venueName: z.string().min(3, 'Informe o local'),
  eventDate: z.string().refine(val => new Date(val) > new Date(), { message: 'A data deve ser no futuro' }),
  capacity: z.coerce.number().min(1, 'A capacidade deve ser maior que zero'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo'),
});
type EditForm = z.infer<typeof editSchema>;

export function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Organizador';

  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);

  // Filtros
  const [filterDate, setFilterDate] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [filterSales, setFilterSales] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');

  // Edit Modal
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const { register: registerEdit, handleSubmit: handleEditSubmit, formState: { errors: editErrors }, reset: resetEdit, setValue: setEditValue } = useForm<EditForm>({
    resolver: zodResolver(editSchema)
  });

  const fetchMyEvents = async () => {
    try {
      setFetchingEvents(true);
      const response = await api.get('/events/mine');
      setMyEvents(response.data);
    } catch (err) {
      console.error("Erro ao buscar meus eventos", err);
    } finally {
      setFetchingEvents(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const onDeleteEvent = async (id: string) => {
    if (!window.confirm("Atenção: Você está prestes a cancelar e excluir este evento definitivamente. Deseja continuar?")) return;
    
    try {
      await api.delete(`/events/${id}`);
      alert("Evento excluído com sucesso!");
      fetchMyEvents();
    } catch (err: any) {
      alert("Não foi possível excluir o evento no momento. Verifique se há reservas ativas.");
    }
  };

  const openEditModal = (evt: Event) => {
    setEditingEvent(evt);
    setEditValue('venueName', evt.venueName);
    setEditValue('capacity', evt.capacity);
    setEditValue('price', evt.price);
    
    const d = new Date(evt.eventDate);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setEditValue('eventDate', d.toISOString().slice(0,16));
  };

  const onEdit = async (data: EditForm) => {
    if (!editingEvent) return;
    setSavingEdit(true);
    try {
      const payload = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString()
      };
      await api.put(`/events/${editingEvent.id}`, payload);
      alert('Informações do evento atualizadas com sucesso!');
      setEditingEvent(null);
      resetEdit();
      fetchMyEvents();
    } catch (err: any) {
      alert('Erro ao atualizar evento.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtragem
  const filteredEvents = useMemo(() => {
    return myEvents.filter(evt => {
      if (filterDate === 'UPCOMING' && new Date(evt.eventDate) <= new Date()) return false;
      if (filterDate === 'PAST' && new Date(evt.eventDate) > new Date()) return false;
      
      const soldRatio = evt.capacity > 0 ? evt.soldCount / evt.capacity : 0;
      if (filterSales === 'HIGH' && soldRatio < 0.5) return false;
      if (filterSales === 'LOW' && soldRatio >= 0.5) return false;

      return true;
    }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [myEvents, filterDate, filterSales]);

  // KPIs
  const isHappeningSoon = (date: string) => {
    const diffDays = (new Date(date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };
  const isHighSales = (sold: number, capacity: number) => capacity > 0 && (sold / capacity) > 0.8;

  const totalCriados = myEvents.length;
  const jaRealizados = myEvents.filter(evt => new Date(evt.eventDate) < new Date()).length;
  const proximosDias = myEvents.filter(evt => isHappeningSoon(evt.eventDate)).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        
        {/* CABEÇALHO E KPIs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Olá, {firstName}! 👋</h1>
            <p className="text-gray-500 mt-2">Bem-vindo ao seu painel de gestão. Aqui você acompanha as vendas e gerencia seus shows cadastrados.</p>
          </div>
          <Button onClick={() => navigate('/organizador/novo-evento')} className="shadow-md h-12 px-6 text-lg">
            ➕ Publicar Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-primary-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total de Eventos Criados</h3>
            <p className="text-4xl font-black text-gray-900">{totalCriados}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Eventos Próximos (7 Dias)</h3>
            <p className="text-4xl font-black text-gray-900">{proximosDias}</p>
            <p className="text-xs text-blue-600 font-medium mt-2">Prepare-se para estes shows!</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Eventos Já Realizados</h3>
            <p className="text-4xl font-black text-gray-900">{jaRealizados}</p>
            <p className="text-xs text-green-600 font-medium mt-2">Histórico de sucessos concluídos.</p>
          </div>
        </div>

        {/* LISTA DE EVENTOS E FILTROS */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-black text-gray-900">Sua Agenda de Shows</h2>
          
          <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <select className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer hover:text-primary-600 transition-colors" value={filterDate} onChange={e => setFilterDate(e.target.value as any)}>
              <option value="ALL">🗓 Todas as Datas</option>
              <option value="UPCOMING">Apenas Futuros</option>
              <option value="PAST">Já Realizados</option>
            </select>
            <div className="w-px bg-gray-200 mx-1"></div>
            <select className="bg-transparent border-none text-sm font-medium text-gray-700 outline-none cursor-pointer hover:text-primary-600 transition-colors" value={filterSales} onChange={e => setFilterSales(e.target.value as any)}>
              <option value="ALL">📈 Desempenho de Vendas</option>
              <option value="HIGH">🔥 Alta Procura (&gt;50%)</option>
              <option value="LOW">🐢 Baixa Procura (&lt;50%)</option>
            </select>
          </div>
        </div>

        {fetchingEvents ? (
          <p className="text-center text-gray-500 py-10">Carregando sua agenda de eventos...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            {myEvents.length === 0 ? (
              <>
                <p className="text-gray-500 text-lg font-medium">Você ainda não possui nenhum show agendado.</p>
                <p className="text-gray-400 text-sm mt-1 mb-6">Importe seu primeiro evento da Ticketmaster e comece a vender ingressos hoje mesmo!</p>
                <Button variant="outline" onClick={() => navigate('/organizador/novo-evento')}>
                  Explorar Catálogo Ticketmaster
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg font-medium">Nenhum evento corresponde aos filtros selecionados.</p>
                <Button variant="outline" className="mt-6" onClick={() => {
                  setFilterDate('ALL');
                  setFilterSales('ALL');
                }}>
                  Limpar Filtros
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredEvents.map(evt => {
              const hot = isHighSales(evt.soldCount, evt.capacity);
              const soon = isHappeningSoon(evt.eventDate);

              return (
                <Card key={evt.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-l-4 border-l-primary-500 hover:shadow-md transition-shadow">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-gray-900">{evt.title}</h3>
                      {hot && <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">🔥 Quase Esgotado</span>}
                      {soon && <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">⏰ Nesta Semana</span>}
                    </div>
                    <p className="text-gray-600 text-sm">📍 {evt.venueName} &nbsp;•&nbsp; 📅 {new Date(evt.eventDate).toLocaleString('pt-BR')}</p>
                    
                    <div className="mt-4 flex items-center gap-6">
                      <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm flex gap-2 items-center">
                        <span className="text-gray-500 font-medium">Progresso das Vendas:</span> 
                        <span className="font-black text-gray-900">{evt.soldCount}</span> 
                        <span className="text-gray-400">/ {evt.capacity}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Valor do Ingresso</span>
                        <span className="font-black text-xl text-primary-700">R$ {evt.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 w-full lg:w-auto flex flex-row gap-3">
                    <Button variant="outline" className="flex-1 lg:flex-none border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => openEditModal(evt)}>
                      Ajustar Dados
                    </Button>
                    <Button variant="outline" className="flex-1 lg:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={() => onDeleteEvent(evt.id)}>
                      Excluir
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL DE EDIÇÃO */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1">Gerenciar Evento</h2>
            <p className="text-sm text-gray-500 mb-4">{editingEvent.title}</p>
            
            <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4">
              <Input label="Local do Evento" {...registerEdit('venueName')} error={editErrors.venueName?.message} />
              <Input label="Data e Hora" type="datetime-local" {...registerEdit('eventDate')} error={editErrors.eventDate?.message} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nova Capacidade" type="number" {...registerEdit('capacity')} error={editErrors.capacity?.message} />
                <Input label="Novo Preço (R$)" type="number" step="0.01" {...registerEdit('price')} error={editErrors.price?.message} />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={() => setEditingEvent(null)}>Cancelar</Button>
                <Button type="submit" isLoading={savingEdit}>Salvar Alterações</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}