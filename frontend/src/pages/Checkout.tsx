import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { type Reservation } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Checkout() {
    const { reservationId } = useParams();
    const navigate = useNavigate();

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loadingRes, setLoadingRes] = useState(true);

    // Estados do formulário de cartão mockado
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    const [paying, setPaying] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState<'IDLE' | 'SUCCESS' | 'DECLINED'>('IDLE');

    useEffect(() => {
        async function fetchReservation() {
            try {
                // Chamada real: const res = await api.get(`/reservations/${reservationId}`); setReservation(res.data);

                // Mock provisório
                setReservation({
                    id: reservationId || '123',
                    clientId: 'cliente1',
                    eventId: '1',
                    quantity: 2,
                    totalAmount: 500.00,
                    status: 'PENDING_PAYMENT'
                });
            } catch (err) {
                console.error("Reserva não encontrada");
            } finally {
                setLoadingRes(false);
            }
        }
        fetchReservation();
    }, [reservationId]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaying(true);
        setStatusFeedback('IDLE');

        try {
            // Chamada real: await api.post(`/payments`, { reservationId, cardNumber, expiry, cvv, name });

            // Simulação para o mock (Cartões terminados em 0000 recusam para testarmos os 2 caminhos)
            setTimeout(() => {
                if (cardNumber.endsWith('0000')) {
                    setStatusFeedback('DECLINED');
                } else {
                    setStatusFeedback('SUCCESS');
                    // Após 2 segundos do sucesso, joga o usuário pra tela de "Meus Ingressos"
                    setTimeout(() => navigate('/meus-ingressos'), 2500);
                }
                setPaying(false);
            }, 1500);

        } catch (err: any) {
            // Se for chamada real, o backend vai mandar um 400 ou 422 avisando que recusou
            setStatusFeedback('DECLINED');
            setPaying(false);
        }
    };

    if (loadingRes) return <div className="text-center p-20">Carregando dados do pedido...</div>;
    if (!reservation) return <div className="text-center p-20">Reserva não encontrada.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
                    <p className="text-gray-500 mt-2">Falta pouco para garantir seus ingressos!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Formulário de Pagamento */}
                    <div className="md:col-span-2">
                        <Card>
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                💳 Dados de Pagamento
                            </h2>

                            {statusFeedback === 'SUCCESS' && (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 font-medium text-center">
                                    Pagamento Aprovado! Ingressos gerados com sucesso. Redirecionando...
                                </div>
                            )}
                            {statusFeedback === 'DECLINED' && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 font-medium text-center">
                                    Pagamento Recusado. Verifique os dados do cartão e tente novamente.
                                </div>
                            )}

                            <form onSubmit={handlePayment} className="space-y-4">
                                <Input
                                    label="Nome impresso no cartão"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    disabled={paying || statusFeedback === 'SUCCESS'}
                                />
                                <Input
                                    label="Número do Cartão"
                                    placeholder="0000 0000 0000 0000 (Termine em 0000 para forçar recusa)"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(e.target.value)}
                                    required
                                    disabled={paying || statusFeedback === 'SUCCESS'}
                                    maxLength={19}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Validade (MM/AA)"
                                        placeholder="12/30"
                                        value={expiry}
                                        onChange={e => setExpiry(e.target.value)}
                                        required
                                        disabled={paying || statusFeedback === 'SUCCESS'}
                                    />
                                    <Input
                                        label="CVV"
                                        placeholder="123"
                                        type="password"
                                        maxLength={4}
                                        value={cvv}
                                        onChange={e => setCvv(e.target.value)}
                                        required
                                        disabled={paying || statusFeedback === 'SUCCESS'}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={paying}
                                    disabled={statusFeedback === 'SUCCESS'}
                                    className="mt-6 text-lg py-3"
                                >
                                    Confirmar Pagamento - R$ {reservation.totalAmount.toFixed(2)}
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* Resumo do Pedido */}
                    <div className="md:col-span-1">
                        <Card className="bg-gray-800 text-white border-none shadow-xl">
                            <h3 className="text-lg font-bold mb-4 text-gray-200 border-b border-gray-700 pb-2">Resumo do Pedido</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Quantidade</span>
                                    <span className="font-bold">{reservation.quantity}x Ingressos</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Taxa de conveniência</span>
                                    <span className="font-bold text-green-400">Grátis</span>
                                </div>
                                <div className="border-t border-gray-700 pt-4 mt-4 flex justify-between items-center">
                                    <span className="text-gray-300">Total</span>
                                    <span className="text-2xl font-bold">R$ {reservation.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Pagamento 100% seguro (simulado). Seus dados não são armazenados.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}