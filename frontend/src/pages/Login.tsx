import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Tokens falsos gerados apenas para teste no Front-End sem precisar do backend
  const MOCK_TOKENS = {
    CLIENTE: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnRlQHRlc3RlLmNvbSIsInJvbGUiOiJDTElFTlRFIiwiaWQiOiIxMjMiLCJpYXQiOjE1MTYyMzkwMjJ9.mocked_signature",
    ORGANIZADOR: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcmdhbml6YWRvckB0ZXN0ZS5jb20iLCJyb2xlIjoiT1JHQU5JWkFET1IiLCJpZCI6IjQ1NiIsImlhdCI6MTUxNjIzOTAyMn0=.mocked_signature",
    PORTARIA: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwb3J0YXJpYUB0ZXN0ZS5jb20iLCJyb2xlIjoiUE9SVEFSSUEiLCJpZCI6Ijc4OSIsImlhdCI6MTUxNjIzOTAyMn0=.mocked_signature"
  };

  const handleMockLogin = (role: 'CLIENTE' | 'ORGANIZADOR' | 'PORTARIA') => {
    login(MOCK_TOKENS[role]);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Elite Tickets</h1>
          <p className="text-gray-500 mt-2">Ambiente de Testes (Mock)</p>
          <p className="text-sm text-primary-600 mt-2 font-medium">Escolha qual perfil deseja simular:</p>
        </div>
        
        <div className="space-y-4">
          <Button fullWidth onClick={() => handleMockLogin('CLIENTE')}>
            Logar como CLIENTE
          </Button>
          
          <Button fullWidth variant="secondary" onClick={() => handleMockLogin('ORGANIZADOR')}>
            Logar como ORGANIZADOR
          </Button>
          
          <Button fullWidth variant="outline" onClick={() => handleMockLogin('PORTARIA')}>
            Logar como PORTARIA
          </Button>
        </div>
      </Card>
    </div>
  );
}
