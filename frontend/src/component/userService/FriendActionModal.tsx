"use client";

import React, {useEffect, useState, useCallback} from "react";
import styles from "@/styles/userService/ModalFriends.module.css";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
  getReceivedFriendRequests,
  getFriendList,
  getFriendshipStatus, // ✨ 추가
} from "@/api/userService/friends";

type TabType = "add" | "requests" | "friends";

interface FriendItem {
  friendId: number;
  userSignId: string;
}

const ITEMS_PER_PAGE = 5;

// ---------------------------
// 탭별 목록 아이템 컴포넌트
// ---------------------------

interface RequestItemProps extends FriendItem {
  onAccept: (friendId: number) => void;
  onReject: (friendId: number) => void;
}

const RequestItem: React.FC<RequestItemProps> = ({userSignId, friendId, onAccept, onReject}) => (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0">
      <span className="font-semibold text-gray-700">{userSignId}</span>
      <div className="flex space-x-2">
        <button
            onClick={() => onAccept(friendId)}
            className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition"
        >
          수락
        </button>
        <button
            onClick={() => onReject(friendId)}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          거절
        </button>
      </div>
    </div>
);

interface FriendListItemProps extends FriendItem {
  onRemove: (friendId: number) => void;
}

const FriendListItem: React.FC<FriendListItemProps> = ({userSignId, friendId, onRemove}) => (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0">
      <span className="font-semibold text-gray-700">{userSignId}</span>
      <button
          onClick={() => onRemove(friendId)}
          className={styles.listItemDeleteButton}
      >
        삭제
      </button>
    </div>
);

// ---------------------------
// 메인 모달 컴포넌트
// ---------------------------

export default function FriendManagerModal({
                                             currentUserSignId,
                                             isOpen,
                                             onClose,
                                           }: {
  currentUserSignId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabType>("add");
  const [inputId, setInputId] = useState("");
  const [requests, setRequests] = useState<FriendItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const [friendsCurrentPage, setFriendsCurrentPage] = useState(1);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsData, friendsData] = await Promise.all([
        getReceivedFriendRequests(),
        getFriendList(),
      ]);

      setRequests(
          requestsData.map((d: any) => ({
            friendId: d.friendId,
            userSignId: d.requesterSignId
          }))
      );

      setFriends(
          friendsData.map((d: any) => ({
            friendId: d.friendId,
            userSignId: d.requesterSignId === currentUserSignId ? d.receiverSignId : d.requesterSignId,
          }))
      );
    } catch (err) {
      console.error("Failed to load friend data", err);
      setRequests([]);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserSignId]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setRequestsCurrentPage(1);
      setFriendsCurrentPage(1);
    }
  }, [isOpen, loadData]);

  // ✨ 수정: 친구 요청 전 상태 확인 로직 추가
  const sendRequest = async () => {
    const trimmedId = inputId.trim();

    // 입력값 검증
    if (!trimmedId) {
      return alert("아이디를 입력해주세요");
    }

    // 자기 자신에게 요청하는 경우
    if (trimmedId === currentUserSignId) {
      return alert("자신에게는 친구를 추가할 수 없습니다");
    }

    try {
      // ✨ 친구 관계 상태 확인
      const status = await getFriendshipStatus(currentUserSignId, trimmedId);

      // 이미 친구 관계가 존재하는 경우
      if (status) {
        if (status.friendsStatus === "ACCEPTED") {
          return alert("이미 친구 관계입니다");
        } else if (status.friendsStatus === "PENDING") {
          // 요청자가 현재 사용자인 경우
          if (status.requesterSignId === currentUserSignId) {
            return alert("이미 친구 요청을 보낸 상태입니다");
          } else {
            // 상대방이 요청자인 경우
            return alert("상대방이 이미 친구 요청을 보냈습니다. '친구 요청' 탭에서 확인해주세요");
          }
        } else if (status.friendsStatus === "BLOCKED") {
          return alert("차단된 사용자입니다");
        }
      }

      // 상태 확인 완료 후 친구 요청 전송
      await sendFriendRequest(currentUserSignId, trimmedId);
      alert("친구 요청을 보냈습니다!");
      setInputId("");
    } catch (err: any) {
      alert(err.message || "요청 실패");
    }
  };

  const accept = async (friendId: number) => {
    try {
      await acceptFriendRequest(currentUserSignId, friendId);
      alert("친구 요청을 수락했습니다.");
      loadData();
    } catch (err: any) {
      alert(err.message || "수락 실패");
    }
  };

  const reject = async (friendId: number) => {
    try {
      await rejectFriendRequest(currentUserSignId, friendId);
      alert("친구 요청을 거절했습니다.");
      loadData();
    } catch (err: any) {
      alert(err.message || "거절 실패");
    }
  };

  const remove = async (friendId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteFriend(currentUserSignId, friendId);
      alert("친구가 삭제되었습니다.");
      loadData();
    } catch (err: any) {
      alert(err.message || "삭제 실패");
    }
  };

  if (!isOpen) return null;

  const getPaginationData = (list: FriendItem[], currentPage: number) => {
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = list.slice(startIndex, endIndex);
    return { currentItems, totalItems, totalPages };
  };

  const { currentItems: currentRequests, totalItems: totalRequests, totalPages: requestsTotalPages } = getPaginationData(requests, requestsCurrentPage);
  const { currentItems: currentFriends, totalItems: totalFriends, totalPages: friendsTotalPages } = getPaginationData(friends, friendsCurrentPage);

  const PaginationControls = ({totalPages, currentPage, setCurrentPage}: {
    totalPages: number,
    currentPage: number,
    setCurrentPage: (page: number) => void
  }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center space-x-2 mt-4">
          <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="py-1 px-3">
            {currentPage} / {totalPages}
          </span>
          <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
    );
  };

  const TabButton = ({label, type, count}: { label: string, type: TabType, count?: number }) => (
      <button
          onClick={() => {
            setTab(type);
            if (type === 'requests') setRequestsCurrentPage(1);
            if (type === 'friends') setFriendsCurrentPage(1);
          }}
          className={`flex-1 text-center py-3 font-semibold transition relative ${
              tab === type
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
          }`}
      >
        {label}
        {count !== undefined && count > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
              {count}
            </span>
        )}
      </button>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    }

    switch (tab) {
      case "add":
        return (
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">친구 ID로 추가</h3>
              <div className="flex space-x-2">
                <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
                    placeholder="친구의 ID를 입력하세요"
                    className="flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendRequest}
                    className="px-6 py-3 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                >
                  요청
                </button>
              </div>
            </div>
        );
      case "requests":
        return (
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">받은 친구 요청 ({totalRequests})</h3>
              <div className="border border-gray-200 rounded">
                {totalRequests === 0 ? (
                    <p className="p-4 text-center text-gray-500">받은 친구 요청이 없습니다.</p>
                ) : (
                    currentRequests.map((item) => (
                        <RequestItem
                            key={item.friendId}
                            {...item}
                            onAccept={accept}
                            onReject={reject}
                        />
                    ))
                )}
              </div>
              <PaginationControls
                  totalPages={requestsTotalPages}
                  currentPage={requestsCurrentPage}
                  setCurrentPage={setRequestsCurrentPage}
              />
            </div>
        );
      case "friends":
        return (
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">내 친구 목록 ({totalFriends})</h3>
              <div className="border border-gray-200 rounded">
                {totalFriends === 0 ? (
                    <p className="p-4 text-center text-gray-500">등록된 친구가 없습니다.</p>
                ) : (
                    currentFriends.map((item) => (
                        <FriendListItem
                            key={item.friendId}
                            {...item}
                            onRemove={remove}
                        />
                    ))
                )}
              </div>
              <PaginationControls
                  totalPages={friendsTotalPages}
                  currentPage={friendsCurrentPage}
                  setCurrentPage={setFriendsCurrentPage}
              />
            </div>
        );
      default:
        return null;
    }
  };

  return (
      <>
        <div className={styles.modalBackdrop} onMouseDown={onClose} />
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className={styles.closeButton}>×</button>
          <div className="p-8 border-b">
            <div className="mb-6">
              <h2 className={styles.modalTitle}>친구 관리</h2>
            </div>
            <div className="flex -mx-8 border-b">
              <TabButton label="친구 추가" type="add"/>
              <TabButton label="친구 요청" type="requests" count={requests.length}/>
              <TabButton label="친구 목록" type="friends" count={friends.length}/>
            </div>
          </div>
          <div className="flex flex-col flex-grow">
            {renderContent()}
          </div>
        </div>
      </>
  );
}