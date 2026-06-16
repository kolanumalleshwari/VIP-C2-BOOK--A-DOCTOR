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
      // Connect to the backend socket server (Vite configuration proxies root to localhost:5000 in dev)
      // For socket connections, we use the root URL.
      socketInstance = io(window.location.origin, {
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
