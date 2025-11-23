export interface LikeToggleResponseDTO {
  isLiked: boolean;   // 좋아요 여부 (true: 좋아요 됨, false: 취소됨)
  likeCount: number;  // 갱신된 총 좋아요 수
}
/**
 * 게시글
 * */
export interface PostEntity {
  postId: number;
  authorId: string;
  title: string;
  content: string;
  thumbnail?: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}


export interface PostCreationRequestDTO {
  title: string;
  content: string;
  isPublished: boolean;
  thumbnail?: string;
  tags: string[];
}

export interface PostDetailDTO extends PostEntity {
  comments?: CommentDTO[];
}
/**
 * 댓글, 대댓글
 * */
export interface CommentEntity {
  commentId: number;
  postId: number;
  userId: string; //
  parentId?: number;
  content: string;
  // ... 생략
  replies?: CommentEntity[];
  childCount: number;
}

export interface CommentDTO {
  commentId: number;
  postId: number;
  userId: string;
  parentId: number | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  childCount: number;

  // 여기만 이렇게 바꾸면 됨!!!
  replies: CommentDTO[];        // ← 이 줄 유지 (프론트에서 쓰는 이름)
  childComments?: never;
}

export interface CommentCreationRequestDTO {
  postId: number;
  parentCommentId: number | null;
  content: string;
}

export interface CommentUpdateRequestDTO {
  content: string;
}

/**
 * 태그
 * */
export interface TagEntity {
  tagId: number;
  tagName: string;
}

export interface PostTagIdEntity {
  postId: number;
  tagId: number;
}

export interface PostTagEntity {
  postTagId: PostTagIdEntity;
  postId: number;
  tagId: number;
  post?: PostEntity;
  tag?: TagEntity;

}

/**
 * 좋아요
 * */
export interface LikeEntity {
  postTagId: PostTagIdEntity;
  postId: number;
  tagId: number;
  post?: PostEntity;
  tag?: TagEntity;

}

export interface PaginatedResponse<T> {
  content: T[];          // 실제 데이터 리스트
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;         // 마지막 페이지 여부
  totalPages: number;    // 전체 페이지 수
  totalElements: number; // 전체 데이터 수
  size: number;          // 페이지 크기
  number: number;        // 현재 페이지 번호 (0부터 시작)
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;        // 첫 페이지 여부
  numberOfElements: number;
  empty: boolean;
}