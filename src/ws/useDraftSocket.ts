import { useEffect, useRef, useState, useCallback } from 'react';
import { OutboundClientMessage, InboundServerMessage } from './types';
import { useNotification } from '../notifications/NotificationContext';

type ConnectionState = 'connecting' | 'open' | 'closed';

interface UseDraftSocketReturn {
  send: (msg: OutboundClientMessage) => void;
  lastMessage: InboundServerMessage | null;
  connectionState: ConnectionState;
}

export const useDraftSocket = (idToken: string | null): UseDraftSocketReturn => {
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('closed');
  const [lastMessage, setLastMessage] = useState<InboundServerMessage | null>(null);
  const { notify } = useNotification()

  useEffect(() => {
    if (!idToken) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      console.error('VITE_WEBSOCKET_URL not configured');
      return;
    }

    const connectWebSocket = () => {
      const url = `${wsUrl}?idToken=${encodeURIComponent(idToken)}`;
      const socket = new WebSocket(url);

      socket.onopen = () => {
        setConnectionState('open');
        notify("Connected to draft", 'success')
      };

      socket.onmessage = (event) => {
        try {
          const message: InboundServerMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          notify("Unexpected Error: Failed to parse WebSocket message", 'error')
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        notify('Websocket Error', 'error')
      };

      socket.onclose = () => {
        setConnectionState('closed');
        notify(`Disconnected from draft`, 'info')
      };

      socketRef.current = socket;
    };

    setConnectionState('connecting');
    connectWebSocket();

    return () => {
      socketRef.current?.close();
    };
  }, [idToken]);

  const send = useCallback((msg: OutboundClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return { send, lastMessage, connectionState };
};
