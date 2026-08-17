export type UserRole = 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Event {
  id: string;
  title: string;
  venueName: string;
  eventDate: string;
  capacity: number;
  price: number;
  soldCount: number;
  seatMapEnabled: boolean;
  organizerId: string;
  status: 'PUBLISHED' | 'CANCELLED';
}

export interface Reservation {
  id: string;
  clientId: string;
  eventId: string;
  quantity?: number;
  seatIds?: string[];
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DECLINED';
}

export interface Ticket {
  id: string;
  eventId: string;
  reservationId: string;
  qrToken: string;
  shareToken: string;
  status: 'VALID' | 'USED';
  usedAt?: string;
}
