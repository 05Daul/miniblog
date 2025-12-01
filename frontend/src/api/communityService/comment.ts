// src/api/communityService/comment.ts
import {COMMUNITYSERVICE_API} from "@/config/env";
import {
  CommunityPostType,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest
} from "@/types/communityService/communityType";

export async function createComment(
    type: CommunityPostType,
    communityId: number,
    request: CreateCommentRequest,
    userSignId: string
): Promise<number> {
  const url = `${COMMUNITYSERVICE_API}/comments/${type.toUpperCase()}/${communityId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "userSignId": userSignId,
    },
    body: JSON.stringify(request),
  });

  if (response.status === 201) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `댓글 작성 실패: HTTP ${response.status}`);
  }
}

export async function getComments(
    type: CommunityPostType,
    communityId: number
): Promise<CommentResponse[]> {
  const url = `${COMMUNITYSERVICE_API}/comments/${type.toUpperCase()}/${communityId}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `댓글 조회 실패: HTTP ${response.status}`);
  }
}

export async function getReplies(commentId: number): Promise<CommentResponse[]> {
  const url = `${COMMUNITYSERVICE_API}/comments/${commentId}/replies`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `대댓글 조회 실패: HTTP ${response.status}`);
  }
}

export async function getCommentCount(
    type: CommunityPostType,
    communityId: number
): Promise<number> {
  const url = `${COMMUNITYSERVICE_API}/comments/${type.toUpperCase()}/${communityId}/count`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `댓글 수 조회 실패: HTTP ${response.status}`);
  }
}

export async function updateComment(
    type: CommunityPostType,
    communityId: number,
    commentId: number,
    request: UpdateCommentRequest,
    userSignId: string
): Promise<void> {
  // 백엔드 CommentController의 PUT 경로: /community/{type}/{communityId}/comments/{commentId}
  const url = `${COMMUNITYSERVICE_API}/${type.toUpperCase()}/${communityId}/comments/${commentId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "userSignId": userSignId,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `댓글 수정 실패: HTTP ${response.status}`);
  }
}

export async function deleteComment(
    type: CommunityPostType,
    communityId: number,
    commentId: number,
    userSignId: string
): Promise<void> {
  const url = `${COMMUNITYSERVICE_API}/${type.toUpperCase()}/${communityId}/comments/${commentId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "userSignId": userSignId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `댓글 삭제 실패: HTTP ${response.status}`);
  }
}