// src/types/communityService/communityType.ts

import {FormatEnum} from "sharp";

export enum RecruitmentStatus {
  RECRUITING = "RECRUITING", // 모집중
  COMPLETED = "COMPLETED",  // 모집 마감
  CLOSED = "CLOSED"      // 기타 사유로 종료
}

export enum PostFormat {
  ONLINE = "ONLINE",     // 온라인
  OFFLINE = "OFFLINE",   // 오프라인
  HYBRID = "HYBRID"      // 혼합 (선택 사항)
}

export enum CommunityPostType {
  CONCERN = "CONCERN",
  PROJECT = "PROJECT",
  STUDY = "STUDY",
}

/* ==================== 요청 DTO ==================== */
export interface CreateConcernRequest {
  title: string;
  content: string;
  tagNames: string[];  // API 명세에 맞게 tagNames로 수정
}

export interface CreateProjectRequest {
  title: string;
  content: string;
  tagNames: string[];
  status: RecruitmentStatus,
  teamSize?: number,
  format: PostFormat,
  deadline: string;

}

export interface CreateStudyRequest {
  title: string;
  content: string;
  tagNames: string[];
  status: RecruitmentStatus,
  format: PostFormat,
  startDate: string;
  schedule?: string
}

/* ==================== 응답 DTO ==================== */

// 목록에서 쓰는 요약 정보
export interface PostSummaryResponse {
  communityId: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  userId: string;

}

export interface UpdateCommentRequest {
  content: string;
}

// 상세 페이지에서 쓰는 전체 정보
export interface PostDetailResponse {
  userId: string;
  communityId: number;
  title: string;
  content: string;
  authorNickname: string;
  authorUserId?: string;  // 작성자 ID (삭제 권한 체크용)
  createdAt: string;
  updatedAt?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  isLiked?: boolean;      // 현재 로그인 유저의 좋아요 여부
  postType?: CommunityPostType;
  tags?: string[];
}

/* ==================== 프론트에서 확장해서 쓰는 타입 ==================== */
export interface CommunityPost extends PostSummaryResponse {
  postType: CommunityPostType;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  tags: string[];
  recruitmentDeadline?: string;
  startDate?: string;
  teamSize?: number; // ProjectEntity에 있음
  schedule?: string; // StudyEntity에 있음
  deadline?: string;
  status?: RecruitmentStatus;
}

/* ==================== 댓글 ==================== */
export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number | null;  // 대댓글일 때만 (null 허용)
}

export interface CommentResponse {
  commentId: number;
  content: string;
  authorNickname: string;
  createdAt: string;
  updatedAt?: string;
  userId:string;
  isDeleted?: boolean;
  parentCommentId?: number | null;  // 부모 댓글 ID (최상위 댓글이면 null)
  replies?: CommentResponse[]; // 자식 댓글 목록
}

/* ==================== 페이지네이션 응답 ==================== */
export interface Page<T> {
  content: T[];
  pageable: {
    sort: { sorted: boolean; unsorted: boolean; empty: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: { sorted: boolean; unsorted: boolean; empty: boolean };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}