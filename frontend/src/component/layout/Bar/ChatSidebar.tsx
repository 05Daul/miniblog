// src/component/chatService/ChatSidebar.tsx

import React, { useState } from 'react';
import ChatRoomList from '@/component/chatService/ChatRoomList';
import ChatRoom from '@/component/chatService/ChatRoom';

interface ChatSidebarProps {
  currentUserId: string;
  currentUserName?: string;
  onClose: () => void;
}

export default function ChatSidebar({ currentUserId, currentUserName = "나", onClose }: ChatSidebarProps) {
  // 🎯 수정 1: ID와 Name을 모두 저장하는 객체 상태로 변경
  const [selectedRoom, setSelectedRoom] = useState<{ id: string, name: string } | null>(null);

  return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* 오버레이 (바깥 클릭 시 닫힘) */}
        <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
        />

        {/* 사이드바 본체 */}
        <div className="relative w-full max-w-4xl h-full bg-gray-50 shadow-2xl flex">
          {/* 왼쪽: 채팅방 리스트 */}
          <div className="w-96 border-r bg-white">
            <ChatRoomList
                currentUserId={currentUserId}
                // 🎯 수정 2: onSelectRoom에서 roomId와 roomName을 모두 받아 상태에 저장
                onSelectRoom={(roomId, roomName) => setSelectedRoom({ id: roomId, name: roomName })}
            />
          </div>

          {/* 오른쪽: 선택된 채팅방 */}
          <div className="flex-1 bg-white">
            {selectedRoom ? (
                <ChatRoom
                    roomId={selectedRoom.id}
                    roomName={selectedRoom.name} // 🎯 수정 3: roomName 전달
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    // 🎯 수정 4: onBack 함수 전달 (목록으로 돌아감)
                    onBack={() => setSelectedRoom(null)}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  ← 채팅방을 선택하세요
                </div>
            )}
          </div>

          {/* 닫기 버튼 */}
          <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      </div>
  );
}