import {BLOGSERVICE_API} from "../../config/env"
import {
  LikeToggleResponseDTO,
  PaginatedResponse,
  PostCreationRequestDTO,
  PostEntity
} from "../../types/blogService/blogType"


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

// ✅ 수정된 부분: 반환 타입을 PostEntity로 명확히 하고, response.json()을 사용합니다.
export async function writeFeed(formData: FormData, userSignId: string): Promise<PostEntity> { // <--- 반환 타입 명시
  console.log("글쓰기 메서드 실행")
  const url = `${BLOGSERVICE_API}/write`;

  const tagsValue = (formData.get("tags") as string | null) || '';

  const requestBody: PostCreationRequestDTO = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    isPublished: formData.get("isPublished") === 'true',
    thumbnail: formData.get("thumbnail") as string | undefined,
    // 쉼표(,)로 구분된 태그 문자열을 배열로 변환
    tags: tagsValue
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "userSignId": userSignId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      // 🚨 수정: response.text() 대신 response.json()을 사용합니다.
      const result: PostEntity = await response.json();
      console.log("게시글 작성 성공:", result);
      return result; // PostEntity 객체를 반환
    } else {
      const errorText = await response.text();
      console.error(`게시글 작성 실패 (HTTP ${response.status}):`, errorText);
      throw new Error(errorText || `게시글 작성 실패: 상태 코드 ${response.status}`);
    }

  } catch (error) {
    console.error("API 호출 중 예외 발생:", error);
    throw error;
  }
}

export async function updatePost(postId: number, userSignId: string ,postData: PostCreationRequestDTO): Promise<PostEntity> {
  // 백엔드 컨트롤러: @PostMapping("/write/{postId}")
  const url = `${BLOGSERVICE_API}/write/${postId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "userSignId": userSignId,
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText || `게시글 수정 실패: HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('게시글 수정 중 오류 발생:', error);
    throw error;
  }
}

export async function deleteFeed(postId: number): Promise<string> {
  const url = `${BLOGSERVICE_API}/delete/post?postId=${postId}`;

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (response.ok) {
    return await response.text(); // "게시물이 삭제되었습니다."
  } else {
    const errorText = await response.text(); // "게시글이 존재하지 않습니다."
    throw new Error(errorText || `게시글 삭제 실패: HTTP ${response.status}`);
  }
}

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

export async function readPost(postId: number): Promise<PostEntity> {
  console.log("게시물 읽어오기 실행");
  const url = `${BLOGSERVICE_API}/readpost?postId=${postId}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    // 1. 성공 시: 예상대로 PostEntity JSON 객체를 반환합니다.
    return await response.json();
  } else {
    // 2. 실패 시: response.text()를 사용하되, 응답 본문이 비어있을 경우를 대비합니다.
    const errorText = await response.text().catch(() => ''); // 텍스트 파싱 실패 시 빈 문자열 반환

    // 에러 메시지 구성: 서버가 보낸 메시지가 있으면 사용, 없으면 기본 메시지 사용
    const errorMessage = errorText || `게시물 조회 실패: HTTP ${response.status} 응답`;

    throw new Error(errorMessage);
  }
}
export async function addTagToPost(postId: number, tagName: string): Promise<string> {
  const url = `${BLOGSERVICE_API}/tag/add?postId=${postId}&tagName=${encodeURIComponent(tagName)}`;

  const response = await fetch(url, {
    method: "POST",
  });

  if (response.ok) {
    return await response.text(); // "태그가 추가되었습니다."
  } else {
    const errorText = await response.text(); // 오류 메시지 반환
    throw new Error(errorText || `태그 추가 실패: HTTP ${response.status}`);
  }
}

export async function addTagsToPost(postId: number, tagNames: string[]): Promise<string> {
  const url = `${BLOGSERVICE_API}/tags/add?postId=${postId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tagNames), // List<String>을 JSON Array로 전송
  });

  if (response.ok) {
    return await response.text(); // "태그들이 추가되었습니다."
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `여러 태그 추가 실패: HTTP ${response.status}`);
  }
}

export async function removeTagFromPost(postId: number, tagName: string): Promise<string> {
  const url = `${BLOGSERVICE_API}/tag/remove?postId=${postId}&tagName=${encodeURIComponent(tagName)}`;

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (response.ok) {
    return await response.text(); // "태그가 제거되었습니다."
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `태그 제거 실패: HTTP ${response.status}`);
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
    // 백엔드에서 Page<PostEntity> 형태로 반환된 JSON을 파싱
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `게시물 조회 실패: HTTP ${response.status}`);
  }
}