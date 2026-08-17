import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { pathname } = useLocation();

    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        return isActive 
            ? "text-sm font-bold text-primary-600 bg-primary-50 px-3 py-2 rounded-lg transition-colors" 
            : "text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors";
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-black text-primary-600 tracking-tight">
                            Elite<span className="text-gray-900">Tickets</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'ORGANIZADOR' && (
                                    <>
                                        <Link to="/organizador/eventos" className={getLinkClass('/organizador/eventos')}>
                                            Dashboard
                                        </Link>
                                        <Link to="/organizador/novo-evento" className={getLinkClass('/organizador/novo-evento')}>
                                            Novo Evento
                                        </Link>
                                    </>
                                )}
                                {user?.role === 'CLIENTE' && (
                                    <>
                                        <Link to="/" className={getLinkClass('/')}>
                                            Home
                                        </Link>
                                        <Link to="/meus-ingressos" className={getLinkClass('/meus-ingressos')}>
                                            Meus Ingressos
                                        </Link>
                                    </>
                                )}
                                <div className="pl-2 border-l border-gray-200">
                                    <Button variant="outline" onClick={logout} className="h-9">Sair</Button>
                                </div>
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