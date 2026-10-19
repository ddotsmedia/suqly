import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Reads the user id from the JWT payload for display only; the server checks the token.
export function currentUserId(): number | null {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.sub === 'number' ? payload.sub : null;
  } catch {
    return null;
  }
}

export function connectMessagesSocket(): Socket | null {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  return io(API_URL, { auth: { token }, transports: ['websocket'] });
}
