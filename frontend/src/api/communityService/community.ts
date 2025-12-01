// src/api/communityService/community.ts
import { COMMUNITYSERVICE_API } from "@/config/env"; // 환경변수 설정 필요
import {
  CommunityPostType,
  CreateConcernRequest,
  CreateProjectRequest,
  CreateStudyRequest,
  PostDetailResponse,
  PostSummaryResponse
} from "@/types/communityService/communityType";

export async function createConcern(userSignId: string, request: CreateConcernRequest): Promise<number> {
  const url = `${COMMUNITYSERVICE_API}/concerns`;

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
    throw new Error(errorText || `고민 게시글 작성 실패: HTTP ${response.status}`);
  }
}

export async function getConcernDetail(communityId: number, userSignId?: string): Promise<PostDetailResponse> {
  const url = `${COMMUNITYSERVICE_API}/concerns/${communityId}`;

  const headers: HeadersInit = {};
  if (userSignId) {
    headers["userSignId"] = userSignId;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `고민 게시글 상세 조회 실패: HTTP ${response.status}`);
  }
}

export async function getConcernList(page: number = 0, size: number = 20): Promise<Page<PostSummaryResponse>> {
  const url = `${COMMUNITYSERVICE_API}/concerns?page=${page}&size=${size}&sort=createdAt,DESC`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `고민 게시글 목록 조회 실패: HTTP ${response.status}`);
  }
}

export async function deleteConcern(communityId: number, userSignId: string): Promise<void> {
  const url = `${COMMUNITYSERVICE_API}/concerns/${communityId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "userSignId": userSignId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `고민 게시글 삭제 실패: HTTP ${response.status}`);
  }
}

// 프로젝트 관련 함수 (고민과 유사)
export async function createProject(userSignId: string, request: CreateProjectRequest): Promise<number> {
  const url = `${COMMUNITYSERVICE_API}/projects`;

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
    throw new Error(errorText || `프로젝트 게시글 작성 실패: HTTP ${response.status}`);
  }
}

export async function getProjectDetail(communityId: number, userSignId?: string): Promise<PostDetailResponse> {
  const url = `${COMMUNITYSERVICE_API}/projects/${communityId}`;

  const headers: HeadersInit = {};
  if (userSignId) {
    headers["userSignId"] = userSignId;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `프로젝트 게시글 상세 조회 실패: HTTP ${response.status}`);
  }
}

export async function getProjectList(page: number = 0, size: number = 20): Promise<Page<PostSummaryResponse>> {
  const url = `${COMMUNITYSERVICE_API}/projects?page=${page}&size=${size}&sort=createdAt,DESC`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `프로젝트 게시글 목록 조회 실패: HTTP ${response.status}`);
  }
}

export async function deleteProject(communityId: number, userSignId: string): Promise<void> {
  const url = `${COMMUNITYSERVICE_API}/projects/${communityId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "userSignId": userSignId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `프로젝트 게시글 삭제 실패: HTTP ${response.status}`);
  }
}

// 스터디 관련 함수 (유사)
export async function createStudy(userSignId: string, request: CreateStudyRequest): Promise<number> {
  const url = `${COMMUNITYSERVICE_API}/studies`;

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
    throw new Error(errorText || `스터디 게시글 작성 실패: HTTP ${response.status}`);
  }
}

export async function getStudyDetail(communityId: number, userSignId?: string): Promise<PostDetailResponse> {
  const url = `${COMMUNITYSERVICE_API}/studies/${communityId}`;

  const headers: HeadersInit = {};
  if (userSignId) {
    headers["userSignId"] = userSignId;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `스터디 게시글 상세 조회 실패: HTTP ${response.status}`);
  }
}

export async function getStudyList(page: number = 0, size: number = 20): Promise<Page<PostSummaryResponse>> {
  const url = `${COMMUNITYSERVICE_API}/studies?page=${page}&size=${size}&sort=createdAt,DESC`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `스터디 게시글 목록 조회 실패: HTTP ${response.status}`);
  }
}

export async function deleteStudy(communityId: number, userSignId: string): Promise<void> {
  const url = `${COMMUNITYSERVICE_API}/studies/${communityId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "userSignId": userSignId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `스터디 게시글 삭제 실패: HTTP ${response.status}`);
  }
}

// 공통 타입 (Page)
export interface Page<T> {
  content: T[];
  pageable: {
    sort: { sorted: boolean; unsorted: boolean; empty: boolean };
    offset: number;
    pageNumber: number;
    pageSize: number;
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