import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let socketInstance;

    if (user) {
      // Connect to the backend socket server
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
      const socketUrl = import.meta.env.VITE_API_URL || (isLocal ? window.location.origin : 'https://vip-c2-book-a-doctor.onrender.com');
      socketInstance = io(socketUrl, {
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        console.log('Real-time notification socket connected');
        // Register user with socket mapping
        socketInstance.emit('register_user', user.id);
      });

      // Listen for push notifications
      socketInstance.on('notification_received', (notification) => {
        console.log('Push notification received:', notification);
        toast.info(
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-800 dark:text-white">{notification.title}</span>
            <span className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notification.message}</span>
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      });

      setSocket(socketInstance);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
