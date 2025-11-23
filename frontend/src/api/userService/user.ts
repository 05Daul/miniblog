import { USERSERVICE_API } from "@/config/env";
import {
  UserDTO,
  LoginDTO,
  FriendReqDTO,
  FriendsResDTO,
} from "@/types/userService/user";

// 로그인 응답 타입 정의 (accessToken은 헤더에서 추출)
export interface LoginResponse {
  userSignId: string;
  role: string;
  refreshToken: string;
  accessToken: string; // HTTP 헤더에서 추출됨
}

// 1. 회원가입 (POST /user/signup)
export async function signup(userDto: UserDTO) {
  const url = `${USERSERVICE_API}/signup`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userDto),
  });

  const text = await response.text();

  if (response.status === 201) {
    return { success: true, message: text || "회원가입이 완료되었습니다." };
  }

  // 모든 에러도 메시지 그대로 반환
  return { success: false, message: text || "회원가입 중 문제가 발생했습니다." };
}

// 2. 로그인 (POST /user/login)
export async function login(loginDto: LoginDTO): Promise<LoginResponse> {
  const url = `${USERSERVICE_API}/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginDto),
  });

  if (response.ok) { // 200 OK
    // Authorization 헤더에서 Bearer 토큰 추출
    const authHeader = response.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";

    // 응답 본문 파싱 (Map<String, String> -> JS Object)
    const body: { [key: string]: string } = await response.json();

    return {
      userSignId: body["userSignId"],
      role: body["role"],
      refreshToken: body["refreshToken"],
      accessToken: accessToken,
    };
  } else {
    throw new Error(`로그인 실패: HTTP ${response.status}`);
  }
}

// 3. 친구 요청 (POST /user/friends)
export async function requestFriend(requesterSignId: string, reqDto: FriendReqDTO): Promise<FriendsResDTO> {
  const url = `${USERSERVICE_API}/friends`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "userSignId": requesterSignId, // 요청자 ID (RequestHeader)
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqDto),
  });

  if (response.status === 201) { // 201 CREATED
    return await response.json(); // FriendsResDTO 반환
  } else {
    // 서버의 상태 코드 및 예외 처리 로직 반영
    let errorMessage = `친구 요청 실패: HTTP ${response.status}`;

    switch (response.status) {
      case 404: // IllegalArgumentException (ID를 찾을 수 없음)
        errorMessage = "요청자 또는 수신자 ID를 찾을 수 없습니다.";
        break;
      case 400: // IllegalStateException (본인에게 신청)
        errorMessage = "본인에게 친구 신청을 할 수 없습니다.";
        break;
      case 409: // IllegalStateException (이미 친구/요청 중)
        errorMessage = "이미 친구 관계이거나 요청이 전송된 상태입니다.";
        break;
      case 500: // 그 외 서버 오류
        errorMessage = "친구 요청 중 서버 오류가 발생했습니다.";
        break;
    }

    throw new Error(errorMessage);
  }
}

// 4. 친구 요청 수락 (PUT /user/friends/{requesterSignId}/accept)
export async function acceptFriend(receiverSignId: string, requesterSignId: string): Promise<FriendsResDTO> {
  // requesterSignId는 PathVariable로 URL에 포함
  const url = `${USERSERVICE_API}/friends/${requesterSignId}/accept`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "userSignId": receiverSignId, // 수락하는 사용자 ID (RequestHeader)
      "Content-Length": "0", // body가 없는 PUT 요청
    },
  });

  if (response.ok) { // 200 OK
    return await response.json(); // FriendsResDTO 반환
  } else {
    // 서버의 예외 처리 로직 반영
    let errorMessage = `친구 요청 수락 실패: HTTP ${response.status}`;

    switch (response.status) {
      case 404: // IllegalArgumentException (요청을 찾을 수 없음)
        errorMessage = "요청을 보낸 사용자 ID를 찾을 수 없거나, 대기 중인 요청이 없습니다.";
        break;
      case 400: // IllegalStateException (자기 자신에게 요청)
        errorMessage = "자기 자신의 요청을 수락할 수 없습니다.";
        break;
      case 409: // IllegalStateException (이미 친구/PENDING 상태 아님)
        errorMessage = "이미 친구 관계이거나 요청 상태가 유효하지 않습니다.";
        break;
      case 500: // 그 외 서버 오류
        errorMessage = "친구 요청 수락 중 서버 오류가 발생했습니다.";
        break;
    }

    throw new Error(errorMessage);
  }
}