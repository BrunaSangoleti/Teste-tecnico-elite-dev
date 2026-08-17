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
                <div>
                  <Input 
                    label="Número do Cartão" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumber} 
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setCardNumber(val);
                    }} 
                    required 
                    disabled={paying || statusFeedback === 'SUCCESS'}
                    maxLength={19}
                  />
                  <p className="text-xs text-orange-600 mt-1 font-medium">
                    * Alerta: Para fins de teste, o sistema irá recusar cartões finalizados em 0000.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input 
                      label="Validade (MM/AA)" 
                      placeholder="12/30" 
                      value={expiry} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setExpiry(val);
                      }} 
                      required 
                      maxLength={5}
                      disabled={paying || statusFeedback === 'SUCCESS'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas números. O formato mês/ano é gerado automaticamente.
                    </p>
                  </div>

                  <div>
                    <Input 
                      label="CVV" 
                      placeholder="123" 
                      type="password"
                      maxLength={3}
                      value={cvv} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCvv(val.substring(0, 3));
                      }} 
                      required 
                      disabled={paying || statusFeedback === 'SUCCESS'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Código de 3 dígitos no verso do seu cartão.
                    </p>
                  </div>
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
            <div className="bg-gray-900 text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
              <h3 className="text-xl font-black mb-6 text-white border-b border-gray-700 pb-4 relative z-10">Resumo do Pedido</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Quantidade</span>
                  <span className="font-bold text-white">{quantity}x Ingressos</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Taxa de conveniência</span>
                  <span className="font-bold text-green-400">Grátis</span>
                </div>
                <div className="border-t border-gray-700 pt-6 mt-6 flex justify-between items-end">
                  <span className="text-gray-300 font-medium pb-1">Total a Pagar</span>
                  <span className="text-3xl font-black text-primary-400">R$ {Number(totalAmount).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}