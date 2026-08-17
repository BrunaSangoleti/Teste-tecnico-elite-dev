import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

type ValidationResult = 'IDLE' | 'VALIDO' | 'JA_UTILIZADO' | 'EVENTO_ERRADO' | 'INVALIDO' | 'ERROR' | 'ID_INVALIDO';

export function GateValidator() {
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<ValidationResult>('IDLE');
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  // Em um sistema real o porteiro escolheria em qual evento ele está na guarita
  const [eventId, setEventId] = useState('');

  const [scannedCode, setScannedCode] = useState('');

  useEffect(() => {
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
  }, []);

  // Effect dedicado para lidar com os escaneamentos da câmera sem prender variáveis de estado antigas
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
      alert("Por favor, digite o ID do evento que você está validando.");
      return;
    }
    
    // Validação de formato para evitar que o Spring Boot retorne erro 400 genérico de parser
    if (!isValidUUID(eventId)) {
      setResult('ID_INVALIDO');
      setResponseMsg("O ID do evento deve ter o formato de um código UUID válido (ex: 123e4567-e89b-12d3-a456-426614174000).");
      return;
    }

    if (!qrToken || loading) return;
    
    // Evita loop da câmera, mas permite forçar o envio manual do mesmo código
    if (!isManual && qrToken === lastScanned) return;
    
    setLoading(true);
    setLastScanned(qrToken);
    
    try {
      const response = await api.post('/tickets/validate', { eventId, code: qrToken });
      setResult(response.data.result as ValidationResult);
      setResponseMsg(response.data.message || '');
    } catch (err: any) {
      setResult('ERROR');
      // Se for erro 400, possivelmente o QR code (code) mandou um JSON malformado
      if (err.response?.status === 400) {
         setResponseMsg("Código preenchido está em um formato irreconhecível.");
      } else {
         setResponseMsg(err.response?.data?.message || 'Erro na comunicação com a API. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackConfig = () => {
    switch(result) {
      case 'VALIDO': return { color: 'bg-green-500', title: 'ACESSO LIBERADO', desc: responseMsg || 'Ingresso válido!' };
      case 'JA_UTILIZADO': return { color: 'bg-yellow-500', title: 'JÁ UTILIZADO', desc: responseMsg || 'Este ingresso já passou pela portaria.' };
      case 'EVENTO_ERRADO': return { color: 'bg-orange-500', title: 'EVENTO ERRADO', desc: responseMsg || 'Ingresso pertence a outro evento.' };
      case 'INVALIDO': return { color: 'bg-red-600', title: 'CÓDIGO INVÁLIDO', desc: responseMsg || 'O código/QR Code digitado não existe ou foi adulterado.' };
      case 'ID_INVALIDO': return { color: 'bg-red-800', title: 'ID DO EVENTO INVÁLIDO', desc: responseMsg };
      case 'ERROR': return { color: 'bg-gray-800', title: 'ERRO', desc: responseMsg };
      default: return { color: 'bg-gray-900', title: 'AGUARDANDO LEITURA', desc: 'Aponte o QR Code ou digite o código manualmente.' };
    }
  };

  const feedback = getFeedbackConfig();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Validação de Portaria</h1>
        
        <div className="mb-6 max-w-xs mx-auto">
          <Input 
            label="ID do Evento na Guarita:" 
            placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000" 
            value={eventId} 
            onChange={e => setEventId(e.target.value)} 
          />
        </div>

        <div className={`${feedback.color} transition-colors duration-300 rounded-xl p-8 text-center text-white mb-8 shadow-lg`}>
          <h2 className="text-4xl font-black mb-2">{loading ? '...' : feedback.title}</h2>
          <p className="text-lg opacity-90">{loading ? 'Validando...' : feedback.desc}</p>
          
          {result !== 'IDLE' && (
            <Button variant="outline" className="mt-4 bg-white/20 text-white hover:bg-white/30 border-none" onClick={() => {setResult('IDLE'); setLastScanned(''); setManualCode(''); setScannedCode('');}}>
              Ler Próximo
            </Button>
          )}
        </div>

        <Card className="mb-8">
          <h3 className="font-bold mb-4 text-center">Câmera</h3>
          <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg"></div>
        </Card>

        <Card>
          <h3 className="font-bold mb-4">Digitação Manual</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleValidate(manualCode, true); }} className="flex gap-4">
            <Input 
              label="" 
              placeholder="Digite o código interno do ingresso..." 
              value={manualCode} 
              onChange={e => setManualCode(e.target.value)} 
              className="flex-grow"
            />
            <Button type="submit" disabled={loading || !manualCode || !eventId}>
              Validar
            </Button>
          </form>
        </Card>

      </main>
    </div>
  );
}