import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import { type Event } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

type ValidationResult = 'IDLE' | 'VALIDO' | 'JA_UTILIZADO' | 'EVENTO_ERRADO' | 'INVALIDO' | 'ERROR' | 'ID_INVALIDO';

export function GateValidator() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Porteiro';

  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState('');
  
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<ValidationResult>('IDLE');
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [scannedCode, setScannedCode] = useState('');

  // Busca a lista de eventos para o porteiro escolher facilmente
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (err) {
        console.error("Erro ao buscar eventos para a portaria", err);
      }
    }
    loadEvents();
  }, []);

  // Inicia o scanner APENAS se um evento estiver selecionado
  useEffect(() => {
    if (!eventId) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render((decodedText) => {
      setScannedCode(decodedText);
    }, () => {});

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [eventId]);

  useEffect(() => {
    if (scannedCode) {
      handleValidate(scannedCode, false);
    }
  }, [scannedCode]);

  const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const handleValidate = async (qrToken: string, isManual: boolean = false) => {
    if (!eventId) {
      alert("Por favor, selecione o evento que você está validando.");
      return;
    }
    
    if (!isValidUUID(eventId)) {
      setResult('ID_INVALIDO');
      setResponseMsg("ID do evento é inválido no sistema.");
      return;
    }

    if (!qrToken || loading) return;
    
    // Evita ler duas vezes o mesmo código acidentalmente na câmera, mas permite envio manual
    if (!isManual && qrToken === lastScanned) return;
    
    setLoading(true);
    setLastScanned(qrToken);
    
    try {
      const response = await api.post('/tickets/validate', { eventId, code: qrToken });
      setResult(response.data.result as ValidationResult);
      setResponseMsg(response.data.message || '');
      
      // Limpa a digitação manual em caso de sucesso ou erro, para preparar para o próximo
      if (isManual) setManualCode('');
    } catch (err: any) {
      setResult('ERROR');
      if (err.response?.status === 400) {
         setResponseMsg("Formato do ingresso irreconhecível.");
      } else {
         setResponseMsg(err.response?.data?.message || 'Erro de conexão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackConfig = () => {
    switch(result) {
      case 'VALIDO': return { color: 'bg-green-500', title: 'ACESSO LIBERADO', desc: responseMsg || 'Ingresso válido! Pode entrar.' };
      case 'JA_UTILIZADO': return { color: 'bg-yellow-500', title: 'JÁ UTILIZADO', desc: responseMsg || 'Este ingresso já passou pela catraca.' };
      case 'EVENTO_ERRADO': return { color: 'bg-orange-500', title: 'EVENTO ERRADO', desc: responseMsg || 'O ingresso apresentado pertence a outro show.' };
      case 'INVALIDO': return { color: 'bg-red-600', title: 'CÓDIGO INVÁLIDO', desc: responseMsg || 'Ingresso falso ou não encontrado no sistema.' };
      case 'ID_INVALIDO': return { color: 'bg-red-800', title: 'FALHA DE SISTEMA', desc: responseMsg };
      case 'ERROR': return { color: 'bg-gray-800', title: 'ERRO NA LEITURA', desc: responseMsg };
      default: return { color: 'bg-gray-900', title: 'AGUARDANDO LEITURA', desc: 'Aponte a câmera para o QR Code do cliente.' };
    }
  };

  const feedback = getFeedbackConfig();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Controle de Portaria</h1>
          <p className="text-gray-500 mt-2">Bom trabalho, {firstName}! Controle o acesso de entrada do público.</p>
        </div>
        
        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Qual evento você está trabalhando agora?</label>
          <select 
            className="w-full h-14 text-lg font-medium border-gray-300 rounded-xl shadow-md px-4 border focus:ring-2 focus:ring-primary-500 outline-none bg-white text-gray-900"
            value={eventId} 
            onChange={e => {
              setEventId(e.target.value);
              setResult('IDLE');
              setLastScanned('');
            }} 
          >
            <option value="">-- Selecione o Evento na lista --</option>
            {events.map(evt => (
              <option key={evt.id} value={evt.id}>
                {evt.title} - {new Date(evt.eventDate).toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        </div>

        {!eventId ? (
          <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-200 border-dashed mt-8">
            <span className="text-5xl mb-4 block">🎫</span>
            <h2 className="text-xl font-bold text-gray-900">Selecione o Evento acima</h2>
            <p className="text-gray-500 mt-2">A câmera de leitura de QR Codes será ativada automaticamente assim que você escolher qual evento irá validar.</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className={`${feedback.color} transition-colors duration-300 rounded-2xl p-8 text-center text-white mb-8 shadow-xl relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-3">{loading ? '...' : feedback.title}</h2>
                <p className="text-lg font-medium opacity-90">{loading ? 'Conectando ao servidor...' : feedback.desc}</p>
                
                {result !== 'IDLE' && (
                  <Button variant="outline" className="mt-6 bg-white/20 text-white hover:bg-white/30 border-white/50 px-8 py-3 rounded-full text-lg font-bold transition-all" onClick={() => {setResult('IDLE'); setLastScanned(''); setManualCode(''); setScannedCode('');}}>
                    Liberar Próximo Cliente
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="flex flex-col border-gray-200 shadow-md">
                <h3 className="font-black text-gray-800 mb-4 text-center">Leitor de Câmera</h3>
                <div id="qr-reader" className="w-full mx-auto overflow-hidden rounded-xl border border-gray-100 flex-grow"></div>
              </Card>

              <Card className="flex flex-col border-gray-200 shadow-md justify-center">
                <h3 className="font-black text-gray-800 mb-4 text-center">Digitação Manual</h3>
                <p className="text-sm text-gray-500 text-center mb-6">Em caso de falha na câmera, digite o código de 36 caracteres do ingresso físico.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleValidate(manualCode, true); }} className="flex flex-col gap-4">
                  <Input 
                    label="" 
                    placeholder="Código do Ingresso..." 
                    value={manualCode} 
                    onChange={e => setManualCode(e.target.value)} 
                    className="text-center font-mono"
                  />
                  <Button type="submit" className="py-4 text-lg shadow-md" disabled={loading || !manualCode || !eventId}>
                    Verificar Código
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}