// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function getSockJSUrl(originalUrl: string): string {
  return originalUrl.replace(/^ws(s)?:\/\//, (matched, s) => (s ? 'https://' : 'http://'));
}

interface UseWebSocketProps {
  url: string;
  roomId?: string;
  onMessage: (message: any) => void;
}

export function useWebSocket({ url, roomId, onMessage }: UseWebSocketProps) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const sockUrl = getSockJSUrl(url);

    console.log('🔌 WebSocket 연결 시작:', sockUrl);
    if (roomId) {
      console.log('📡 구독할 방:', roomId);
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      debug: (str) => {
        // 항상 출력 (개발 중)
        console.log('STOMP →', str);
      },

      onConnect: () => {
        console.log('✅ WebSocket 연결 성공');
        setIsConnected(true);

        if (roomId) {
          // ⭐ 핵심 수정: 구독 경로
          // 기존: `/topic/chat/${roomId}` (X)
          // 수정: `/topic/chat.room.${roomId}` (O)
          const subscriptionPath = `/topic/chat.room.${roomId}`;

          console.log(`📡 구독 시작: ${subscriptionPath}`);

          const subscription = client.subscribe(subscriptionPath, (msg) => {
            console.log('📨 메시지 수신 raw:', msg.body);
            try {
              const data = JSON.parse(msg.body);
              console.log('📨 메시지 파싱 완료:', data);
              onMessage(data);
            } catch (e) {
              console.error('❌ 메시지 파싱 실패:', e, msg.body);
            }
          });

          console.log(`✅ 구독 완료:`, subscription.id);
        }
      },

      onStompError: (frame) => {
        console.error('❌ STOMP 오류:', frame.headers['message']);
        console.error('오류 상세:', frame.body);
        setIsConnected(false);
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket 오류:', error);
      },

      onWebSocketClose: () => {
        console.log('🔌 WebSocket 연결 종료');
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [url, roomId, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 WebSocket 정리');
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
      (payload: any) => {
        console.log('=== sendMessage 호출 ===');
        console.log('clientRef.current:', clientRef.current);
        console.log('connected:', clientRef.current?.connected);

        if (!clientRef.current) {
          console.error('❌ clientRef.current가 null입니다!');
          return;
        }

        if (!clientRef.current?.connected) {
          console.warn('❌ WebSocket 연결 안됨 → 메시지 전송 실패');
          return;
        }

        console.log('📤 메시지 전송 시도:', payload);
        console.log('📤 destination:', '/app/chat.message');

        try {
          clientRef.current.publish({
            destination: '/app/chat.message',
            body: JSON.stringify(payload),
          });
          console.log('✅ publish() 호출 완료');
        } catch (error) {
          console.error('❌ publish() 에러:', error);
        }
      },
      []
  );

  return { isConnected, sendMessage };
}