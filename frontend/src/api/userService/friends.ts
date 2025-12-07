// src/api/userService/friends.ts
import { FRIENDSSERVICE_API } from "@/config/env";
import type { FriendsResDTO, FriendReqDTO } from "@/types/userService/friends";

// 1. 인증 토큰을 가져오는 헬퍼 함수
const getAuthToken = (): string | null => {
  // TODO: 실제 프로젝트의 로직에 맞게 로컬 스토리지, 쿠키 등에서 JWT 토큰을 가져오도록 구현하세요.
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error("Authentication token not found.");
    return null;
  }
  return token;
};

// 2. 공통 요청 헤더 생성 함수 (Authorization 헤더 포함)
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("인증 토큰이 필요합니다. 로그인 상태를 확인해주세요.");
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
};


// 공통 응답 타입
interface ApiResponse {
  success: boolean;
  message?: string;
}

// 1. 친구 관계 상태 조회
export async function getFriendshipStatus(
    currentUserSignId: string,
    targetUserSignId: string
): Promise<FriendsResDTO | null> {
  const headers = getAuthHeaders();

  const response = await fetch(
      `${FRIENDSSERVICE_API}/status?targetUserId=${encodeURIComponent(targetUserSignId)}`,
      {
        method: "GET",
        headers: headers,
      }
  );

  if (response.status === 204) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }
  const msg = await response.text();
  console.error(`Status Check Failed: HTTP ${response.status} - ${msg}`);
  throw new Error(msg || "상태 조회 실패");
}

// 2. 친구 요청 보내기
export async function sendFriendRequest(
    currentUserSignId: string,
    receiverSignId: string
): Promise<FriendsResDTO> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/request`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ receiverSignId }),
  });

  if (response.ok) {
    return await response.json();
  }
  const msg = await response.text();
  console.error(`Send Request Failed: HTTP ${response.status} - ${msg}`);
  throw new Error(msg || "친구 요청 실패");
}

// 3. 받은 친구 요청 목록 조회 (수정: 204 처리 및 로깅 추가)
export async function getReceivedFriendRequests(): Promise<FriendsResDTO[]> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/requests/received`, {
    method: "GET",
    headers: headers,
  });

  // ✨ 204 No Content 처리
  if (response.status === 204) {
    return [];
  }

  if (response.ok) {
    return await response.json();
  }

  // ✨ 에러 로깅 추가
  const msg = await response.text();
  console.error(`Received Requests Failed: HTTP ${response.status} - ${msg}`);
  throw new Error(msg || `친구 요청 목록 조회 실패 (Status: ${response.status})`);
}

// 4. 친구 목록 조회 (수정: 204 처리 및 로깅 추가)
export async function getFriendList(): Promise<FriendsResDTO[]> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}`, {
    method: "GET",
    headers: headers,
  });

  // ✨ 204 No Content 처리
  if (response.status === 204) {
    return [];
  }

  if (response.ok) {
    return await response.json();
  }

  // ✨ 에러 로깅 추가
  const msg = await response.text();
  console.error(`Friend List Failed: HTTP ${response.status} - ${msg}`);
  throw new Error(msg || `친구 목록 조회 실패 (Status: ${response.status})`);
}

// 5. 친구 요청 수락
export async function acceptFriendRequest(
    currentUserSignId: string,
    friendId: number
): Promise<FriendsResDTO> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/${friendId}/accept`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Length": "0",
    },
  });

  if (response.ok) {
    return await response.json();
  }
  const msg = await response.text();
  console.error(`Accept Request Failed: HTTP ${response.status} - ${msg}`);
  throw new Error(msg || "수락 실패");
}

// 6. 친구 요청 거절
export async function rejectFriendRequest(
    currentUserSignId: string,
    friendId: number
): Promise<void> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/${friendId}/reject`, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const msg = await response.text();
    console.error(`Reject Request Failed: HTTP ${response.status} - ${msg}`);
    throw new Error(msg || "거절 실패");
  }
}

// 7. 친구 삭제
export async function deleteFriend(
    currentUserSignId: string,
    friendId: number
): Promise<void> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/${friendId}`, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const msg = await response.text();
    console.error(`Delete Friend Failed: HTTP ${response.status} - ${msg}`);
    throw new Error(msg || "친구 삭제 실패");
  }
}

// 8. 유저 차단
export async function blockUser(
    currentUserSignId: string,
    receiverSignId: string
): Promise<FriendsResDTO> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/block`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ receiverSignId }),
  });

  if (response.ok) {
    return await response.json();
  }
  const msg = await response.text();
  console.error(`Block User Failed: HTTP ${response.status} - ${msg}`);
  throw new Error(msg || "차단 실패");
}

// 9. 차단 해제
export async function unblockUser(
    currentUserSignId: string,
    friendId: number
): Promise<void> {
  const headers = getAuthHeaders();

  const response = await fetch(`${FRIENDSSERVICE_API}/${friendId}/unblock`, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const msg = await response.text();
    console.error(`Unblock User Failed: HTTP ${response.status} - ${msg}`);
    throw new Error(msg || "차단 해제 실패");
  }
}