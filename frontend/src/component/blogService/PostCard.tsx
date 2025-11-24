// src/component/blogService/PostCard.tsx
'use client';

import React from "react";
import styles from "@/styles/blogService/post.module.css";
import { PostEntity } from "@/types/blogService/blogType";
import { useRouter } from "next/navigation";

interface PostCardProps {
  post: PostEntity;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  // ✅ HTML 태그 제거 + HTML 엔티티 디코딩
  const stripHtml = (html: string): string => {
    if (!html) return "";

    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      // 임시 div 요소를 사용하여 HTML 파싱 및 엔티티 디코딩
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // 텍스트만 추출 (HTML 태그 제거 + 엔티티 자동 디코딩)
      const text = temp.textContent || temp.innerText || '';

      // 연속된 공백을 하나로 축약
      return text.replace(/\s+/g, ' ').trim();
    }

    // 서버 사이드 렌더링 대응 (fallback)
    return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  };

  const plainText = stripHtml(post.content);
  const previewText = plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;

  const dateStr = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
      <article
          className={styles.card}
          onClick={() => router.push(`/post/${post.postId}`)}
          style={{ cursor: "pointer" }}
      >
        {/*
          ⚠️ [수정된 핵심 부분] ⚠️
          썸네일 유무와 관계없이 .thumbnailWrapper를 항상 렌더링합니다.
          CSS의 height 속성을 통해 기본 높이를 확보하고, 내용물만 조건부 렌더링합니다.
        */}
        <div className={styles.thumbnailWrapper}>
          {post.thumbnail ? (
              // 썸네일이 있을 경우: 기존 로직
              <>
                <img
                    src={post.thumbnail}
                    alt={post.title}
                    className={styles.thumbnail}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div className={styles.overlay}>
                  <h3 className={styles.overlayTitle}>{post.title}</h3>
                </div>
              </>
          ) : (
              // 썸네일이 없을 경우: Placeholder 렌더링
              <div className={styles.noThumbnailPlaceholder}>
                <h3 className={styles.noThumbnailTitle}>{post.title}</h3>
              </div>
          )}
        </div>


        <div className={styles.content}>
          <h3 className={styles.title}>{post.title}</h3>
          <p className={styles.preview}>{previewText}</p>
          <div className={styles.meta}>
            <span className={styles.author}>{post.authorId}</span>
            <span className={styles.date}>{dateStr}</span>
            <span className={styles.views}>조회 {post.viewCount.toLocaleString()}</span>
          </div>

          {(post.tags ?? []).length > 0 && (
              <div className={styles.tags}>
                {(post.tags ?? []).map((tag, i) => (
                    <span
                        key={i}
                        className={styles.tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tag/${encodeURIComponent(tag)}`);
                        }}
                    >
                        #{tag}
                    </span>
                ))}
              </div>
          )}
        </div>
      </article>
  );
}