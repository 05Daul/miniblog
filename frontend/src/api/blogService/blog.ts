import {BLOGSERVICE_API} from "../../config/env"
import {
  LikeToggleResponseDTO,
  PaginatedResponse,
  PostCreationRequestDTO,
  PostEntity,
  PostDetailDTO
} from "../../types/blogService/blogType"

export async function getPostTags(postId: number): Promise<string[]> {
  const url = `${BLOGSERVICE_API}/tags?postId=${postId}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text().catch(() => " ")
    const errorMessage = errorText || `태그 조회 실패: HTTP ${response.status} 응답`;
    throw new Error(errorMessage);
  }
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const url = `${BLOGSERVICE_API}/upload`;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    // 백엔드에서 { "url": "..." } 형태의 JSON을 반환
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `이미지 업로드 실패: HTTP ${response.status}`);
  }
}

export async function toggleLike(postId: number, userSignId: string): Promise<LikeToggleResponseDTO> {
  const url = `${BLOGSERVICE_API}/likes/${postId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "userSignId": userSignId, // 헤더에 userSignId 포함
      },
    });

    if (response.ok) {
      return await response.json(); // { isLiked: true, likeCount: 10 } 반환
    } else {
      const errorText = await response.text();
      throw new Error(errorText || `좋아요 처리 실패: HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("좋아요 API 오류:", error);
    throw error;
  }
}

// ✅ [수정] DTO를 직접 받아 JSON 본문으로 전송하도록 변경
export async function writeFeed(postData: PostCreationRequestDTO, userSignId: string): Promise<PostEntity> {
  console.log("글쓰기 메서드 실행 (JSON DTO 방식)");
  const url = `${BLOGSERVICE_API}/write`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "userSignId": userSignId,
    },
    body: JSON.stringify(postData), // DTO를 JSON 본문으로 전송
  });

  if (response.ok) {
    return await response.json(); // PostEntity 반환
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시글 등록 실패: HTTP ${response.status}`);
  }
}


export async function readPost(postId: number): Promise<PostDetailDTO> {
  const url = `${BLOGSERVICE_API}/${postId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시글 조회 실패: HTTP ${response.status}`);
  }
}

// ✅ [수정] updatePost의 userSignId 인자 위치를 클라이언트 코드와 일치
export async function updatePost(postId: number, postData: PostCreationRequestDTO, userSignId: string): Promise<PostEntity> {
  const url = `${BLOGSERVICE_API}/write/${postId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "userSignId": userSignId, // 헤더에 userSignId 포함
    },
    body: JSON.stringify(postData),
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시글 수정 실패: HTTP ${response.status}`);
  }
}

export async function deleteFeed(postId: number, userSignId: string): Promise<void> {
  const url = `${BLOGSERVICE_API}/${postId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "userSignId": userSignId, // 헤더에 userSignId 포함
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `게시글 삭제 실패: HTTP ${response.status}`);
  }
}

export async function incrementViewCount(postId: number): Promise<string> {
  const url = `${BLOGSERVICE_API}/view?postId=${postId}`;

  const response = await fetch(url, {
    method: "POST",
  });

  if (response.ok) {
    return await response.text(); // "조회수가 증가되었습니다."
  } else {
    const errorText = await response.text(); // 오류 메시지 반환
    throw new Error(errorText || `조회수 증가 실패: HTTP ${response.status}`);
  }
}

export async function getTrendingPosts(page: number = 0, size: number = 10): Promise<PaginatedResponse<PostEntity>> {
  const url = `${BLOGSERVICE_API}/trending?page=${page}&size=${size}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (response.ok) {
    // 백엔드에서 Page<PostEntity> 형태로 반환된 JSON을 파싱
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시물 조회 실패: HTTP ${response.status}`);
  }
}

export async function getRecentPosts(page: number = 0, size: number = 10): Promise<PaginatedResponse<PostEntity>> {
  const url = `${BLOGSERVICE_API}/recent?page=${page}&size=${size}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시물 조회 실패: HTTP ${response.status}`);
  }
}
export async function getFriendsPosts(userSignId: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<PostEntity>> {
  const url = `${BLOGSERVICE_API}/feed?page=${page}&size=${size}`;

  const token = localStorage.getItem('accessToken')
  console.log("--- Friends Posts API Call Debug ---");
  console.log(`User Sign ID: ${userSignId}`);
  console.log(`Token Key Check: 'accessToken'`);
  console.log("------------------------------------");
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "userSignId": userSignId,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,  // 이 한 줄 추가! localStorage 토큰 사용
    }
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시물 조회 실패: HTTP ${response.status}`);
  }
}