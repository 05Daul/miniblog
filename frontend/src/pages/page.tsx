// component/chatService/ChatPage.tsx

"use client";

import { useState, useEffect } from 'react';
import ChatRoom from '@/component/chatService/ChatRoom';
import ChatRoomList from '@/component/chatService/ChatRoomList';
import StartNewChatModal from '@/component/chatService/StartNewChatModal';
import styles from "@/styles/chatService/ChatPage.module.css";
import Layout from "@/component/layout/MainLayout";

interface ChatPageProps {
  currentUserId: string;
  currentUserName: string;
}

export default function ChatPage({ currentUserId: initialUserId, currentUserName: initialUserName }: ChatPageProps) {
  const [selectedRoom, setSelectedRoom] = useState<{id: string, name: string} | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // ✅ WritePage와 동일한 패턴으로 localStorage 사용
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ WritePage와 완전히 동일한 패턴으로 사용자 정보 로드
  useEffect(() => {
    const id = localStorage.getItem('userSignId');
    const name = localStorage.getItem('userName');

    if (id) {
      setCurrentUserId(id);
      setCurrentUserName(name || id);
    } else {
      console.warn("사용자 정보를 찾을 수 없습니다.");
    }

    setIsLoading(false);
  }, []);

  const handleRoomCreated = (newRoom: { roomId: string; roomName: string }) => {
    setShowNewChatModal(false);
    setSelectedRoom({ id: newRoom.roomId, name: newRoom.roomName });
  };

  // ✅ 로딩 중 표시
  if (isLoading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <p>로딩 중...</p>
          </div>
        </Layout>
    );
  }

  // ✅ 로그인 체크
  if (!currentUserId) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <p className="mb-4">로그인이 필요한 서비스입니다.</p>
              <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                로그인하기
              </button>
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className={styles.container}>
          <div className={`${styles.sidebar} ${selectedRoom ? styles.hiddenOnMobile : ''}`}>
            <ChatRoomList
                currentUserId={currentUserId}
                onSelectRoom={(id, name) => setSelectedRoom({ id, name })}
                onCreateRoom={() => setShowNewChatModal(true)}
            />
          </div>

          <div className={styles.main}>
            {selectedRoom ? (
                <ChatRoom
                    roomId={selectedRoom.id}
                    roomName={selectedRoom.name}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    onBack={() => setSelectedRoom(null)}
                />
            ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💬</div>
                  <h3>채팅을 시작하세요</h3>
                  <p>친구를 선택하여 대화를 시작해보세요</p>
                  <button onClick={() => setShowNewChatModal(true)} className={styles.newChatBtn}>
                    새 채팅 시작
                  </button>
                </div>
            )}
          </div>

          {showNewChatModal && (
              <StartNewChatModal
                  currentUserId={currentUserId}
                  onClose={() => setShowNewChatModal(false)}
                  onRoomCreated={handleRoomCreated}
              />
          )}
        </div>
      </Layout>
  );
}