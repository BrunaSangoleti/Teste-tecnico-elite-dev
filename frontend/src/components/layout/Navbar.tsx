import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight">
                            Elite<span className="text-gray-900">Tickets</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'ORGANIZADOR' && (
                                    <Link to="/organizador/eventos" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                                        Meus Eventos (Painel)
                                    </Link>
                                )}
                                {user?.role === 'CLIENTE' && (
                                    <Link to="/meus-ingressos" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                                        Meus Ingressos
                                    </Link>
                                )}
                                {user?.role === 'PORTARIA' && (
                                    <Link to="/portaria" className="text-sm font-bold text-red-600 hover:text-red-700 uppercase">
                                        App da Portaria
                                    </Link>
                                )}
                                <Button variant="outline" onClick={logout}>Sair</Button>
                            </>
                        ) : (
                            <Link to="/login">
                                <Button>Entrar</Button>
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}