// StartNewChatModal.tsx (최종 완성판 - FriendActionModal 참고 수정)

"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { createChatRoom } from '@/api/chatService/chat';
import { getFriendList } from '@/api/userService/friends';
import styles from "@/styles/chatService/StartNewChatModal.module.css";

// 백엔드에서 실제로 오는 그대로의 타입 (FriendActionModal 참고)
interface FriendFromAPI {
  friendId: number;
  requesterSignId: string;
  receiverSignId: string;
  name?: string | null; // name이 없을 수 있음
}

// 프론트에서 쓰고 싶은 완벽하게 안전한 타입
interface Friend {
  friendId: string;
  userSignId: string;
  name: string; // 무조건 string 보장
}

interface StartNewChatModalProps {
  currentUserId: string;
  onClose: () => void;
  onRoomCreated: (newRoom: { roomId: string; roomName: string }) => void;
}

export default function StartNewChatModal({
                                            currentUserId,
                                            onClose,
                                            onRoomCreated,
                                          }: StartNewChatModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const rawData: FriendFromAPI[] = await getFriendList();

        const safeFriends: Friend[] = rawData
        .filter((item): item is FriendFromAPI =>
            !!item &&
            typeof item.friendId !== "undefined" &&
            typeof item.requesterSignId === "string" &&
            typeof item.receiverSignId === "string"
        )
        .map((item): Friend => ({
          friendId: String(item.friendId), // Long → string 변환
          userSignId: item.requesterSignId === currentUserId
              ? item.receiverSignId
              : item.requesterSignId,
          name: item.name?.trim() || (item.requesterSignId === currentUserId ? item.receiverSignId : item.requesterSignId),
        }))
        .filter((friend, index, self) =>
            friend.userSignId &&
            index === self.findIndex(f => f.userSignId === friend.userSignId)
        );

        setFriends(safeFriends);
      } catch (err: any) {
        console.error("친구 목록 로드 실패:", err);
        setError("친구 목록을 불러오지 못했습니다.");
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [currentUserId]); // currentUserId 의존성 추가 (상대방 ID 계산에 필요)

  const toggleFriend = (userSignId: string) => {
    setSelectedFriends(prev =>
        prev.includes(userSignId)
            ? prev.filter(id => id !== userSignId)
            : [...prev, userSignId]
    );
  };

  const handleSubmit = async () => {
    if (selectedFriends.length === 0 || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const participantIds = [...selectedFriends, currentUserId];

      let defaultName = '';
      if (selectedFriends.length === 1) {
        const friend = friends.find(f => f.userSignId === selectedFriends[0]);
        defaultName = friend?.name || selectedFriends[0];
      } else {
        defaultName = `${selectedFriends.length + 1}명의 그룹 채팅`;
      }

      const finalName = roomName.trim() || defaultName;

      const newRoom = await createChatRoom(participantIds, finalName, currentUserId);

      onRoomCreated({
        roomId: newRoom.roomId,
        roomName: newRoom.roomName || finalName,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "채팅방 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAvatarLetter = (friend: Friend) => {
    return friend.name[0]?.toUpperCase() || '?';
  };

  return (
      <>
        <div className={styles.backdrop} onClick={onClose} />
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>새 채팅 시작하기</h2>
            <button onClick={onClose} className={styles.closeBtn} aria-label="닫기">
              <X size={28} />
            </button>
          </div>

          <div className={styles.body}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.inputGroup}>
              <label>채팅방 이름 <span className="text-gray-500">(선택)</span></label>
              <input
                  type="text"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder={selectedFriends.length > 0 ? "그룹 채팅 이름" : "이름 입력 후 친구 선택"}
              />
            </div>

            <div className={styles.friendListSection}>
              <div className={styles.sectionTitle}>
                친구 선택 ({selectedFriends.length}명)
              </div>

              {loading ? (
                  <div className={styles.loading}>
                    <Loader2 className="animate-spin" size={24} />
                    <span>친구 목록을 불러오는 중...</span>
                  </div>
              ) : friends.length === 0 ? (
                  <div className={styles.empty}>친구가 없습니다</div>
              ) : (
                  <div className={styles.friendList}>
                    {friends.map(friend => {
                      const isSelected = selectedFriends.includes(friend.userSignId);
                      return (
                          <div
                              key={friend.friendId}
                              onClick={() => toggleFriend(friend.userSignId)}
                              className={`${styles.friendItem} ${isSelected ? styles.selected : ''}`}
                              role="button"
                              tabIndex={0}
                          >
                            <div className={styles.friendInfo}>
                              <div className={styles.avatar}>
                                {getAvatarLetter(friend)}
                              </div>
                              <div>
                                <div className={styles.friendName}>{friend.name}</div>
                                <div className={styles.friendId}>@{friend.userSignId}</div>
                              </div>
                            </div>
                            {isSelected && <Check size={22} strokeWidth={3} />}
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button
                onClick={handleSubmit}
                disabled={selectedFriends.length === 0 || submitting}
                className={styles.submitBtn}
            >
              {submitting ? (
                  <>생성 중...</>
              ) : (
                  <>채팅 시작하기 {selectedFriends.length > 0 && `(${selectedFriends.length})`}</>
              )}
            </button>
          </div>
        </div>
      </>
  );
}