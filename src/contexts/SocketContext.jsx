import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Déconnecter si l'utilisateur n'est pas authentifié
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Créer la connexion Socket.io
    const token = localStorage.getItem('accessToken');

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://pharmaconnect-backend-179404211924.europe-west1.run.app';

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    // Événements de connexion
    newSocket.on('connect', () => {
      console.log('Socket.io connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket.io error:', error);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  const value = {
    socket,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
