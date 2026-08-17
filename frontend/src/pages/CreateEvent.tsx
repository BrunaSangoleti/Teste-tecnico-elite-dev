import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Navbar } from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const importSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  externalRefId: z.string(),
  venueName: z.string().min(3, 'Informe o local'),
  eventDate: z.string().refine(val => new Date(val) > new Date(), { message: 'A data deve ser no futuro' }),
  capacity: z.coerce.number().min(1, 'A capacidade deve ser maior que zero'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo'),
  seatMapEnabled: z.boolean().default(false),
});
type ImportForm = z.infer<typeof importSchema>;

type CatalogItem = {
  id: string;
  title: string;
  description: string;
  venueName: string;
  venueAddress: string;
  date: string | null;
  imageUrl: string | null;
};

export function CreateEvent() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchStyle, setSearchStyle] = useState('');
  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [importing, setImporting] = useState(false);
  
  const { register: registerImport, handleSubmit: handleImportSubmit, formState: { errors: importErrors }, reset: resetImport, setValue: setImportValue } = useForm<ImportForm>({
    resolver: zodResolver(importSchema)
  });

  const searchTicketmaster = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = [searchStyle, searchQuery].filter(Boolean).join(' ');
    
    if (!finalQuery) {
      alert("Por favor, selecione um estilo musical ou digite o nome de uma banda.");
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/catalog/search?query=${finalQuery}`);
      setCatalogResults(response.data);
      if (response.data.length === 0) {
        alert("Nenhum show encontrado para este estilo ou artista. Tente buscar por termos mais genéricos (como 'Rock' ou 'Pop').");
      }
    } catch (err) {
      console.error(err);
      alert("Ops! Ocorreu um erro ao buscar no catálogo. Tente novamente mais tarde.");
    } finally {
      setSearching(false);
    }
  };

  const openImportModal = (item: CatalogItem) => {
    setSelectedCatalogItem(item);
    setImportValue('title', item.title);
    setImportValue('description', item.description || '');
    setImportValue('externalRefId', item.id);
    setImportValue('venueName', item.venueName);
    
    if (item.date) {
      const d = new Date(item.date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setImportValue('eventDate', d.toISOString().slice(0,16));
    }
  };

  const onImport = async (data: ImportForm) => {
    setImporting(true);
    try {
      const payload = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString()
      };
      await api.post('/events', payload);
      alert('Evento importado e publicado com sucesso!');
      navigate('/organizador/eventos');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao importar evento.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        
        <div className="mb-4">
          <Button variant="outline" className="text-sm border-none shadow-none text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-100" onClick={() => navigate('/organizador/eventos')}>
            ← Voltar para Dashboard
          </Button>
        </div>

        <div className="mb-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="max-w-3xl mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Criar Novo Evento</h2>
            <p className="text-gray-500">
              Expanda sua agenda importando shows diretamente do catálogo global da Ticketmaster. 
              Escolha um estilo musical para se inspirar ou busque por um artista específico.
            </p>
          </div>

          <form onSubmit={searchTicketmaster} className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="md:w-1/3">
              <select 
                className="w-full h-11 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                value={searchStyle}
                onChange={e => setSearchStyle(e.target.value)}
              >
                <option value="">Selecione um estilo musical...</option>
                <option value="Rock">🎸 Rock</option>
                <option value="Pop">🎤 Pop</option>
                <option value="Country">🤠 Country / Sertanejo</option>
                <option value="Dance/Electronic">🎧 Eletrônica / Dance</option>
                <option value="Latin">🥁 Latino / Ritmos Locais</option>
                <option value="Hip-Hop/Rap">🧢 Hip Hop / Rap</option>
                <option value="Classical">🎻 Clássica / Erudita</option>
                <option value="Alternative">🎸 Indie / Alternativo</option>
                <option value="Jazz">🎷 Jazz / Blues</option>
              </select>
            </div>
            <div className="flex-grow">
              <Input 
                label="" 
                placeholder="Qual o nome da banda ou artista? (Opcional)" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <Button type="submit" isLoading={searching} className="md:w-48 h-11">
              Procurar Shows
            </Button>
          </form>

          {catalogResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogResults.map(item => (
                <div key={item.id} className="border border-gray-100 bg-gray-50 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-4" />}
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">{item.description}</p>
                    <p className="text-xs text-primary-700 mt-3 font-semibold bg-primary-50 inline-block px-2 py-1 rounded">📍 {item.venueName}</p>
                  </div>
                  <Button className="mt-5 w-full" onClick={() => openImportModal(item)}>
                    Trazer para minha Gestão
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* MODAL DE IMPORTAÇÃO */}
      {selectedCatalogItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1">Importar Evento</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedCatalogItem.title}</p>
            
            <form onSubmit={handleImportSubmit(onImport)} className="space-y-4">
              <input type="hidden" {...registerImport('title')} />
              <input type="hidden" {...registerImport('description')} />
              <input type="hidden" {...registerImport('externalRefId')} />

              <Input label="Local do Evento" {...registerImport('venueName')} error={importErrors.venueName?.message} />
              <Input label="Data e Hora" type="datetime-local" {...registerImport('eventDate')} error={importErrors.eventDate?.message} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Capacidade" type="number" {...registerImport('capacity')} error={importErrors.capacity?.message} />
                <Input label="Preço (R$)" type="number" step="0.01" {...registerImport('price')} error={importErrors.price?.message} />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="seatMapEnabled" {...registerImport('seatMapEnabled')} className="h-4 w-4 text-primary-600 rounded" />
                <label htmlFor="seatMapEnabled" className="text-sm font-medium text-gray-700">Modo Mapa de Assentos Numéricos</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" type="button" onClick={() => setSelectedCatalogItem(null)}>Cancelar</Button>
                <Button type="submit" isLoading={importing}>Confirmar Importação</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
