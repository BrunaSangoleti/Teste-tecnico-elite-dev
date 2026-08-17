import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { type Ticket } from '../types';

export function MyTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTickets() {
            try {
                // Mock provisório de Ingressos Comprados
                setTickets([
                    {
                        id: 'tkt-1',
                        eventId: '1',
                        reservationId: '123',
                        qrToken: 'mock-qr-token-super-seguro',
                        shareToken: 'token-publico-xyz',
                        status: 'VALID'
                    }
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Ingressos</h1>

                {loading ? (
                    <p>Carregando ingressos...</p>
                ) : tickets.length === 0 ? (
                    <Card className="text-center py-10">
                        <p className="text-gray-500 mb-4">Você ainda não tem nenhum ingresso.</p>
                        <Link to="/" className="text-primary-600 font-bold hover:underline">Ir para a Home</Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tickets.map(ticket => (
                            <Card key={ticket.id} className={`flex flex-col sm:flex-row overflow-hidden ${ticket.status === 'USED' ? 'opacity-60' : ''}`} noPadding>
                                {/* Lado Esquerdo: O QR Code */}
                                <div className="bg-white p-6 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col items-center justify-center min-w-[200px]">
                                    {/* Usando uma API pública só para gerar uma imagem real de QR code provisória */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrToken}`}
                                        alt="QR Code do Ingresso"
                                        className={`w-32 h-32 ${ticket.status === 'USED' ? 'grayscale' : ''}`}
                                    />
                                    <span className={`mt-4 px-3 py-1 text-xs font-bold rounded-full ${ticket.status === 'VALID' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {ticket.status === 'VALID' ? 'VÁLIDO' : 'UTILIZADO'}
                                    </span>
                                </div>

                                {/* Lado Direito: Informações */}
                                <div className="p-6 flex flex-col justify-between w-full">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Festival de Rock 2026</h3>
                                        <p className="text-sm text-gray-500 mt-1">Ingresso # {ticket.id.split('-')[1]}</p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Link de Compartilhamento:</p>
                                        <a
                                            href={`/ingresso/${ticket.shareToken}`}
                                            target="_blank"
                                            className="text-sm text-primary-600 truncate block hover:underline"
                                        >
                                            Ver ingresso público
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}