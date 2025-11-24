// src/api/userService/user.ts (최종 완성본)

import { USERSERVICE_API } from "@/config/env";
import {
  UserDTO,
  LoginDTO,
  FriendReqDTO,
  FriendsResDTO,
} from "@/types/userService/user";

// 공통 응답 타입
interface ApiResponse {
  success: boolean;
  message?: string;
}

// 중복 체크 응답 타입 (백엔드에서 "exists" 또는 "not exists" 같은 문자열 반환 예상)
interface DuplicateCheckResponse {
  available: boolean;   // 프론트에서 쓰기 좋게 통일
}

// 1. 회원가입
export async function signup(userDto: UserDTO): Promise<ApiResponse> {
  const response = await fetch(`${USERSERVICE_API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userDto),
  });

  const text = await response.text();

  if (response.status === 201) {
    return { success: true, message: text || "회원가입 성공" };
  }

  return { success: false, message: text || "회원가입 실패" };
}

// 2. 로그인
export async function login(loginDto: LoginDTO): Promise<{
  userSignId: string;
  role: string;
  refreshToken: string;
  accessToken: string;
}> {
  const response = await fetch(`${USERSERVICE_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginDto),
  });

  if (!response.ok) {
    throw new Error(`로그인 실패: ${response.status}`);
  }

  const authHeader = response.headers.get("Authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";
  const body = await response.json();

  return {
    userSignId: body.userSignId,
    role: body.role,
    refreshToken: body.refreshToken,
    accessToken,
  };
}

// 3. 아이디 중복 체크 → GET /existId?userId=xxx
export async function checkUserSignId(userSignId: string): Promise<DuplicateCheckResponse> {
  const response = await fetch(
      `${USERSERVICE_API}/existId?userId=${encodeURIComponent(userSignId)}`
  );

  const text = await response.text();
  const available = text.trim() === "not exists";
  return { available };
}

// 4. 이메일 중복 체크 → GET /existEmail?email=xxx
export async function checkEmail(email: string): Promise<DuplicateCheckResponse> {
  const response = await fetch(
      `${USERSERVICE_API}/existEmail?email=${encodeURIComponent(email)}`
  );

  const text = await response.text();
  const available = text.trim() === "not exists";
  return { available };
}

// 5. 닉네임 중복 체크 → GET /existNickname?nickname=xxx
export async function checkNickName(nickname: string): Promise<DuplicateCheckResponse> {
  const response = await fetch(
      `${USERSERVICE_API}/existNickname?nickname=${encodeURIComponent(nickname)}`
  );

  const text = await response.text();
  const available = text.trim() === "not exists";
  return { available };
}

// 6. 친구 요청
export async function requestFriend(requesterSignId: string, reqDto: FriendReqDTO): Promise<FriendsResDTO> {
  const response = await fetch(`${USERSERVICE_API}/friends`, {
    method: "POST",
    headers: {
      userSignId: requesterSignId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqDto),
  });

  if (response.status === 201) {
    return await response.json();
  }

  const msg = await response.text();
  throw new Error(msg || "친구 요청 실패");
}

// 7. 친구 요청 수락
export async function acceptFriend(receiverSignId: string, requesterSignId: string): Promise<FriendsResDTO> {
  const response = await fetch(`${USERSERVICE_API}/friends/${requesterSignId}/accept`, {
    method: "PUT",
    headers: {
      userSignId: receiverSignId,
      "Content-Length": "0",
    },
  });

  if (response.ok) {
    return await response.json();
  }

  const msg = await response.text();
  throw new Error(msg || "친구 수락 실패");
}