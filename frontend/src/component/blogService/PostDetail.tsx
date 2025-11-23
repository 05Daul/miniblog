// src/component/blogService/PostDetail.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LikeShareSidebar from './LikeShareSidebar';
import ProgressBar from './ProgressBar';
import TableOfContents from './TableOfContents';
import PostContent from './PostContent';
import CommentSection from './CommentSection'; // 기존 import 유지
import { PostDetailDTO } from '@/types/blogService/blogType';
import { deleteFeed, getPostTags,incrementViewCount } from '@/api/blogService/blog';
import styles from '@/styles/blogService/postDetail.module.css';

// HTML 내용에 제목 태그(H1, H2, H3 등)가 포함되어 있는지 확인하는 함수
const hasHeadings = (htmlContent: string): boolean => {
  if (!htmlContent) return false;
  return /<h[1-3]/i.test(htmlContent);
};

export default function PostDetail({ post }: { post: PostDetailDTO }) {
  const router = useRouter();
  const [currentUserSignId, setCurrentUserSignId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const isAuthor = currentUserSignId === post.authorId;
  const shouldShowToc = hasHeadings(post.content);

  useEffect(() => {
    const userId = localStorage.getItem('userSignId') || '';
    setCurrentUserSignId(userId);

    const updateViewCount = async () => {
      try {
        await incrementViewCount(post.postId);
        console.log(`게시물 ID ${post.postId} 조회수 증가 성공`);
      } catch (error) {
        console.error('조회수 증가 실패:', error);
      }
    };
    updateViewCount();

    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
      setTags(post.tags);
    } else {
      const fetchTags = async () => {
        try {
          const fetchedTags = await getPostTags(post.postId);
          setTags(fetchedTags);
        } catch (error) {
          console.error('태그 가져오기 실패:', error);
          setTags([]);
        }
      };
      fetchTags();
    }
  }, [post]);

  const handleEdit = () => {
    router.push(`/post/edit/${post.postId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      setIsDeleting(true);
      try {
        await deleteFeed(post.postId);
        alert('게시물이 삭제되었습니다.');
        router.push('/');
      } catch (error) {
        console.error('삭제 실패:', error);
        alert('게시물 삭제에 실패했습니다.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
      <>
        <ProgressBar />

        <div className={styles.detailContainer}>
          <header className={styles.postHeader}>
            <h1 className={styles.title}>{post.title}</h1>

            {/* ✅ [수정] 작성자 정보와 수정/삭제 버튼을 별도의 Row로 분리하고 정렬 */}
            <div className={styles.metaRow}>
              <div className={styles.metaInfo}>
                <span className={styles.author}>작성자: {post.authorId}</span>
                <span className={styles.date}> 등록일:
                                {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                <span className={styles.views}> 조회수: {post.viewCount}</span>
              </div>

              {isAuthor && (
                  <div className={styles.authorActions}>
                    <button onClick={handleEdit} className={styles.editButton}>
                      수정
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={styles.deleteButton}
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
              )}
            </div>

            {(tags ?? []).length > 0 && (
                <div className={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                      <span
                          key={index}
                          className={styles.tag}
                          onClick={() => router.push(`/tag/${encodeURIComponent(tag)}`)}
                          style={{ cursor: 'pointer' }}
                          data-color={index % 5}
                      >
                                    #{tag}
                                </span>
                  ))}
                </div>
            )}
          </header>

          {post.thumbnail && (
              <img
                  src={post.thumbnail}
                  alt={post.title}
                  className={styles.postThumbnail}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
              />
          )}

          {/* ✅ [수정] 메인 콘텐츠, 댓글, 양쪽 사이드바를 모두 포함하는 Grid 컨테이너 */}
          <div className={styles.gridWrapper}>

            {/* ⬅️ 1. 왼쪽 사이드바 (좋아요/공유 - 고정) */}
            <aside className={styles.leftSidebar}>

              <div className={styles.stickyBox}>
                <LikeShareSidebar
                    postId={post.postId}/>
              </div>
            </aside>

            {/* ➡️ 2. 중앙 콘텐츠 영역 (게시글 본문 + 댓글) */}
            {/* 댓글 섹션을 메인 콘텐츠와 같은 너비로 통일 */}
            <div className={styles.centralContent}>
              <article className={styles.mainContent}>
                <PostContent content={post.content} />
              </article>

              {/* ✅ [이동/통합] CommentSection이 중앙 콘텐츠 너비를 따르도록 이곳에 배치 */}
              <CommentSection postId={post.postId} comments={post.comments || []} />
            </div>

            {/* ➡️ 3. 오른쪽 목차 (조건부 렌더링 및 고정) */}
            {shouldShowToc && (
                <aside className={styles.sidebar}>
                  <div className={styles.stickyBox}>
                    <TableOfContents content={post.content} />
                  </div>
                </aside>
            )}
          </div>
        </div>
      </>
  );
}