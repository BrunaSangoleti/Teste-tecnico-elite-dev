import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Checkout() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Recebe os dados de amount e quantity via rota do React Router
  const totalAmount = location.state?.totalAmount || 0;
  const quantity = location.state?.quantity || 1;
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  
  const [paying, setPaying] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<'IDLE' | 'SUCCESS' | 'DECLINED'>('IDLE');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setStatusFeedback('IDLE');

    try {
      // Chamada real da API de pagamentos
      await api.post(`/payments/${reservationId}/pay`, { 
        cardNumber, 
        expiry, 
        cvv, 
        name 
      });
      
      setStatusFeedback('SUCCESS');
      // Após 2 segundos do sucesso, joga o usuário pra tela de "Meus Ingressos"
      setTimeout(() => navigate('/meus-ingressos'), 2500);

    } catch (err: any) {
      setStatusFeedback('DECLINED');
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-500 mt-2">Falta pouco para garantir seus ingressos!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
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
                  placeholder="0000 0000 0000 0000 (O backend recusa cartões terminados em 0000)" 
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
                  disabled={statusFeedback === 'SUCCESS' || totalAmount === 0}
                  className="mt-6 text-lg py-3"
                >
                  Confirmar Pagamento - R$ {Number(totalAmount).toFixed(2)}
                </Button>
              </form>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="bg-gray-800 text-white border-none shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-gray-200 border-b border-gray-700 pb-2">Resumo do Pedido</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Quantidade</span>
                  <span className="font-bold">{quantity}x Ingressos</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Taxa de conveniência</span>
                  <span className="font-bold text-green-400">Grátis</span>
                </div>
                <div className="border-t border-gray-700 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-gray-300">Total</span>
                  <span className="text-2xl font-bold">R$ {Number(totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}