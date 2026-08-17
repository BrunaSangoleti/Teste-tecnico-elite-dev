import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

type ValidationResult = 'IDLE' | 'VALID' | 'USED' | 'INVALID_EVENT' | 'INVALID_TOKEN' | 'ERROR';

export function GateValidator() {
    const [manualCode, setManualCode] = useState('');
    const [result, setResult] = useState<ValidationResult>('IDLE');
    const [loading, setLoading] = useState(false);
    const [lastScanned, setLastScanned] = useState('');

    // Simulação do EventId que a portaria está validando naquele dia
    const currentEventId = '1';

    useEffect(() => {
        // Inicializa o leitor de QR Code (Câmera)
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render((decodedText) => {
            // Quando a câmera lê com sucesso
            handleValidate(decodedText);
        }, (error) => {
            // Falhas normais de frame ignoradas
        });

        return () => {
            scanner.clear().catch(console.error);
        };
    }, []);

    const handleValidate = async (qrToken: string) => {
        if (!qrToken || loading || qrToken === lastScanned) return;

        setLoading(true);
        setLastScanned(qrToken); // Evita ler 2x na mesma hora

        try {
            // Chamada real: await api.post('/gate/validate', { eventId: currentEventId, qrToken });

            // MOCK DE RESULTADOS BASEADOS NO CÓDIGO
            setTimeout(() => {
                if (qrToken === 'mock-qr-token-super-seguro') setResult('VALID');
                else if (qrToken === 'usado') setResult('USED');
                else if (qrToken === 'evento-errado') setResult('INVALID_EVENT');
                else setResult('INVALID_TOKEN');
                setLoading(false);
            }, 500);

        } catch (err: any) {
            setResult('ERROR');
            setLoading(false);
        }
    };

    const getFeedbackConfig = () => {
        switch (result) {
            case 'VALID': return { color: 'bg-green-500', title: 'ACESSO LIBERADO', desc: 'Ingresso válido!' };
            case 'USED': return { color: 'bg-yellow-500', title: 'JÁ UTILIZADO', desc: 'Este ingresso já passou pela portaria.' };
            case 'INVALID_EVENT': return { color: 'bg-orange-500', title: 'EVENTO ERRADO', desc: 'Ingresso pertence a outro evento.' };
            case 'INVALID_TOKEN': return { color: 'bg-red-600', title: 'INVÁLIDO', desc: 'Código desconhecido ou fraudado.' };
            default: return { color: 'bg-gray-200', title: 'AGUARDANDO LEITURA', desc: 'Aponte o QR Code ou digite.' };
        }
    };

    const feedback = getFeedbackConfig();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8">Validação de Portaria</h1>

                {/* Painel de Feedback Gigante */}
                <div className={`${feedback.color} transition-colors duration-300 rounded-xl p-8 text-center text-white mb-8 shadow-lg`}>
                    <h2 className="text-4xl font-black mb-2">{loading ? '...' : feedback.title}</h2>
                    <p className="text-lg opacity-90">{loading ? 'Validando...' : feedback.desc}</p>

                    {result !== 'IDLE' && (
                        <Button variant="outline" className="mt-4 bg-white/20 text-white hover:bg-white/30 border-none" onClick={() => { setResult('IDLE'); setLastScanned(''); setManualCode(''); }}>
                            Ler Próximo
                        </Button>
                    )}
                </div>

                <Card className="mb-8">
                    <h3 className="font-bold mb-4 text-center">Câmera</h3>
                    {/* Container pro HTML5-QRCode Injetar a Câmera */}
                    <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg"></div>
                </Card>

                <Card>
                    <h3 className="font-bold mb-4">Digitação Manual</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleValidate(manualCode); }} className="flex gap-4">
                        <Input
                            label=""
                            placeholder="Digite o código interno do ingresso..."
                            value={manualCode}
                            onChange={e => setManualCode(e.target.value)}
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={loading || !manualCode}>
                            Validar
                        </Button>
                    </form>
                </Card>

            </main>
        </div>
    );
}