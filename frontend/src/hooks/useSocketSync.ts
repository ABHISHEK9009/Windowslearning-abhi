import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useSocketSync = () => {
  const queryClient = useQueryClient();
  const { token, user, refreshUser } = useAuth();

  useEffect(() => {
    if (!token || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    const currentUserId = user.id;

    socket.on('connect', () => {
      console.log('Socket connected for real-time sync');
    });

    socket.on('data_update', (data: { type: string }) => {
      console.log('Real-time data update received:', data.type);
      
      switch (data.type) {
        case 'wallet':
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          // Dashboard analytics depends on wallet totals
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;
        case 'sessions':
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
          // Dashboard analytics depends on sessions totals
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;
        case 'requirements':
          queryClient.invalidateQueries({ queryKey: ['requirements'] });
          break;
        case 'notifications':
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          break;
        case 'analytics':
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;
        case 'user':
        case 'profile':
          // AuthContext user state isn't tied to React Query,
          // so we refresh it directly to keep sidebar + settings in sync.
          refreshUser();
          break;
        case 'mentors':
          queryClient.invalidateQueries({ queryKey: ['mentors'] });
          break;
        default:
          // Global refresh if type unknown
          queryClient.invalidateQueries();
      }
    });

    socket.on('receive_message', (payload: { senderId: string; receiverId: string }) => {
      // When the current user receives a message, refresh the inbox + the relevant thread.
      queryClient.invalidateQueries({ queryKey: ['chat_conversations'] });
      if (payload.receiverId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['messages', payload.senderId] });
      }
    });

    socket.on('message_sent', (payload: { senderId: string; receiverId: string }) => {
      // When the current user sends a message, refresh the inbox + the relevant thread.
      queryClient.invalidateQueries({ queryKey: ['chat_conversations'] });
      if (payload.senderId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['messages', payload.receiverId] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user, refreshUser, queryClient]);
};
