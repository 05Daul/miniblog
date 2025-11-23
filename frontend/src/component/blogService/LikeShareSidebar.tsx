// src/component/blogService/LikeShareSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/blogService/postDetail.module.css';
import { toggleLike } from '@/api/blogService/blog'; // API 함수 import

interface LikeShareSidebarProps {
  postId: number;
  initialLikeCount?: number; // 나중에 부모로부터 받을 초기 좋아요 수
  initialIsLiked?: boolean;  // 나중에 부모로부터 받을 초기 좋아요 상태
}

export default function LikeShareSidebar({
                                           postId,
                                           initialLikeCount = 0,
                                           initialIsLiked = false
                                         }: LikeShareSidebarProps) {

  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  // (선택 사항) props로 초기값이 나중에 들어올 경우를 대비해 상태 동기화
  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialIsLiked);
  }, [initialLikeCount, initialIsLiked]);

  const handleLike = async () => {
    // 1. 로그인 확인
    const userSignId = localStorage.getItem('userSignId');
    if (!userSignId) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    if (isLoading) return; // 중복 클릭 방지
    setIsLoading(true);

    try {
      // 2. API 호출
      const result = await toggleLike(postId, userSignId);

      // 3. 상태 업데이트 (서버 응답값으로 갱신)
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);

    } catch (error) {
      console.error("좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl)
    .then(() => alert('게시물 링크가 클립보드에 복사되었습니다.'))
    .catch(err => console.error('클립보드 복사 실패:', err));
  };

  return (
      <div className={styles.reactionContainer}>
        <button
            onClick={handleLike}
            className={`${styles.likeButton} ${isLiked ? styles.activeLike : ''}`} // 좋아요 상태일 때 스타일 추가 가능
            title={isLiked ? "좋아요 취소" : "좋아요"}
            disabled={isLoading}
        >
          {/* 좋아요 상태에 따라 아이콘 변경 (채워진 하트 / 빈 하트) */}
          {isLiked ? '❤️' : '🤍'}
          <span>{likeCount}</span>
        </button>

        <button
            onClick={handleShare}
            className={styles.shareButton}
            title="공유 링크 복사"
        >
          🔗
        </button>
      </div>
  );
}