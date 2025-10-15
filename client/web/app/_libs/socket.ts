import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket | null> {
  if (socket && socket.connected) {
    return socket;
  }


  const token = await getTokenFromCookies();
  
  if (!token) {
    console.warn('No authentication token available for socket connection');
    return null;
  }
  
  const socketUrl = process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/api', '') || 'http://localhost:4000';
  
  socket = io(socketUrl, {
    auth: {
      token: token
    },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

async function getTokenFromCookies(): Promise<string | null> {

  try {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api'}/auth/token`, {
      credentials: 'include',
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
  } catch (error) {
    console.log('Token endpoint not available, trying alternative methods');
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api'}/auth/me`, {
      credentials: 'include',
      method: 'GET'
    });
    
    if (response.ok) {

      const authHeader = response.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }

      const data = await response.json();
      if (data.token) {
        return data.token;
      }

      console.warn('User is authenticated but token not available for socket connection');
      return null;
    }
  } catch (error) {
    console.error('Failed to verify authentication:', error);
  }
  
  return null;
}

export default socket;
