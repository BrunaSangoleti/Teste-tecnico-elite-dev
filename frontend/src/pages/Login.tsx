import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden">
      {/* Imagem de Fundo */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105"
        style={{ 
          backgroundImage: 'url("https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg")',
        }}
      ></div>
      
      {/* Overlay escurecido e com efeito de desfoque */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[6px]"></div>

      {/* Formulário (Frente) */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Card className="w-full shadow-2xl border-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-primary-600 tracking-tight">Elite<span className="text-gray-900">Tickets</span></h1>
            <p className="text-gray-500 mt-2 font-medium">Acesso restrito</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <Input 
              label="E-mail" 
              type="email" 
              placeholder="seu@email.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <Input 
              label="Senha" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            
            <Button type="submit" fullWidth isLoading={loading} className="h-12 text-lg mt-2">
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
