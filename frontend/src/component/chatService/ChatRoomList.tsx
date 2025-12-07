// ChatRoomList.tsx

import React, { useState, useEffect } from 'react';
import { getChatRooms } from '@/api/chatService/chat';
import type { ChatRoom } from '@/types/chatService/chat';
import { Search, Plus } from 'lucide-react';
import styles from '@/styles/chatService/ChatRoomList.module.css';

interface ChatRoomListProps {
  currentUserId: string;
  onSelectRoom: (roomId: string, roomName: string) => void;
  onCreateRoom?: () => void;
}

export default function ChatRoomList({ currentUserId, onSelectRoom, onCreateRoom }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (currentUserId) {
      loadRooms();

      // 30초마다 자동 새로고침 (읽음 상태 업데이트)
      const interval = setInterval(() => {
        loadRooms();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  const loadRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getChatRooms(currentUserId);
      setRooms(data);
    } catch (err: any) {
      console.error('채팅방 목록 로드 실패:', err);
      setError('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return '알 수 없음';

    const now = new Date();
    const messageTime = new Date(dateString);
    const diffInMs = now.getTime() - messageTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    const isThisYear = now.getFullYear() === messageTime.getFullYear();
    if (isThisYear) {
      return `${messageTime.getMonth() + 1}.${messageTime.getDate()}`;
    }
    return `${messageTime.getFullYear().toString().slice(2)}.${(messageTime.getMonth() + 1).toString().padStart(2, '0')}.${messageTime.getDate().toString().padStart(2, '0')}`;
  };

  // 안읽은 메시지 개수 (백엔드에서 제공)
  const getUnreadCount = (room: ChatRoom): number => {
    return room.unreadCount || 0;
  };

  const filteredRooms = rooms.filter(room =>
      room.roomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.lastMessageContent?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>채팅</h2>

          <div className={styles.searchArea}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <input
                  type="text"
                  placeholder="채팅 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
              />
            </div>

          </div>
        </div>

        <div className={styles.roomsList}>
          {error ? (
              <div className={styles.error}>{error}</div>
          ) : loading ? (
              <div className={styles.loading}>채팅방 목록을 불러오는 중...</div>
          ) : filteredRooms.length === 0 ? (
              <div className={styles.empty}>
                {searchQuery ? '검색 결과가 없습니다.' : '채팅방이 없습니다.'}
              </div>
          ) : (
              filteredRooms.map((room) => {
                const unreadCount = getUnreadCount(room);
                return (
                    <div
                        key={room.roomId}
                        onClick={() => onSelectRoom(room.roomId, room.roomName || room.participantIds.filter(id => id !== currentUserId).join(', '))}
                        className={`${styles.roomItem} ${unreadCount > 0 ? styles.unread : ''}`}
                    >
                      <div className={styles.avatarWrapper}>
                        <div className={styles.avatar}>
                          <span className={styles.avatarText}>
                            {room.roomName ? room.roomName.charAt(0) : '?'}
                          </span>
                        </div>
                        {/* 온라인 상태 표시 (선택사항) */}
                      </div>

                      <div className={styles.roomInfo}>
                        <div className={styles.roomHeader}>
                          <h3 className={styles.roomName}>
                            {room.roomName || '이름 없는 방'}
                          </h3>
                          <div className={styles.roomMeta}>
                            <span className={styles.roomTime}>
                              {formatTime(room.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.roomFooter}>
                          <p className={`${styles.lastMessage} ${unreadCount > 0 ? styles.bold : ''}`}>
                            {room.lastMessageContent || '새로운 대화가 시작되었습니다.'}
                          </p>
                          {unreadCount > 0 && (
                              <span className={styles.unreadBadge}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>
      </div>
  );
}