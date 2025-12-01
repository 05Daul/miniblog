// src/api/communityService/like.ts
import { COMMUNITYSERVICE_API } from "@/config/env";
import { CommunityPostType } from "@/types/communityService/communityType";

export async function toggleLike(
    type: CommunityPostType,
    communityId: number,
    userSignId: string
): Promise<boolean> {
  const url = `${COMMUNITYSERVICE_API}/likes/${type.toUpperCase()}/${communityId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "userSignId": userSignId,
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `좋아요 토글 실패: HTTP ${response.status}`);
  }
}

export async function getLikeCount(
    type: CommunityPostType,
    communityId: number
): Promise<number> {
  const url = `${COMMUNITYSERVICE_API}/likes/${type.toUpperCase()}/${communityId}/count`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `좋아요 수 조회 실패: HTTP ${response.status}`);
  }
}

export async function checkLike(
    type: CommunityPostType,
    communityId: number,
    userSignId: string
): Promise<boolean> {
  const url = `${COMMUNITYSERVICE_API}/likes/${type.toUpperCase()}/${communityId}/check`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "userSignId": userSignId,
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `좋아요 여부 확인 실패: HTTP ${response.status}`);
  }
}