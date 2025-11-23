// component/blogService/PostList.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import styles from "@/styles/blogService/post.module.css";
import { getTrendingPosts, getRecentPosts } from "@/api/blogService/blog";
import { PostEntity } from "@/types/blogService/blogType";
const PAGE_SIZE = 10;

// Prop 타입 정의 유지
interface PostListProps {
  postType: 'trending' | 'recent';
}

export default function PostList({ postType }: PostListProps) {
  const [posts, setPosts] = useState<PostEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // pageRef와 hasMoreRef는 현재 로직에서 잘 사용되고 있으므로 유지합니다.
  const pageRef = useRef(0);
  pageRef.current = page;
  const hasMoreRef = useRef(true);
  hasMoreRef.current = hasMore;


  // loadPosts 함수는 useCallback 의존성 배열에 postType을 추가하여,
  // 탭 변경 시 올바른 postType으로 로드되도록 보장합니다.
  const loadPosts = useCallback(async (pageToLoad: number, currentPostType: 'trending' | 'recent') => {
    // ... (기존 loadPosts 로직 유지)
    setLoading(true);

    try {
      const fetchFunction = currentPostType === 'trending' ? getTrendingPosts : getRecentPosts;

      const res = await fetchFunction(pageToLoad, PAGE_SIZE);

      if (res?.content) {
        setPosts(prevPosts =>
            pageToLoad === 0 ? res.content! : [...prevPosts, ...res.content!]
        );

        setHasMore(pageToLoad < res.totalPages - 1);

      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Failed to fetch ${currentPostType} posts:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ 의존성 배열에 아무것도 없으면 currentPostType 변경 시 새 함수가 생성되지 않음.
          // 로직이 postType을 인자로 받으므로, 이 부분을 빈 배열로 두는 것은 유지해도 괜찮습니다.


  // --- 1. postType이 변경될 때 상태 초기화 및 첫 페이지 로드 (유지) ---
  useEffect(() => {
    // ... (기존 로직 유지)
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setLoading(false);
    loadPosts(0, postType);
  }, [postType, loadPosts]);


  // --- 2. Intersection Observer 설정 (로직 수정 없이 유지) ---
  // Observer의 콜백 함수는 최신 hasMoreRef.current를 사용하므로, 로직은 유효합니다.
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0];
          // 로더가 보이고, 로딩 중이 아니며, 더 로드할 데이터가 남아있을 때
          if (target.isIntersecting && !loading && hasMoreRef.current) {
            setPage(prevPage => prevPage + 1);
          }
        },
        {
          root: null,
          rootMargin: '20px',
          threshold: 1.0,
        }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading]); // loading 상태가 변경될 때만 Observer 재설정


  // --- 3. page 상태 변화 감지 및 추가 로딩 (유지) ---
  useEffect(() => {
    if (page > 0) {
      loadPosts(page, postType);
    }
  }, [page, postType, loadPosts]);


  // --- 4. ✅ [수정] 렌더링 결과에 loaderRef 추가 ---
  return (
      <div className={styles.postListContainer}>
        {posts.map(post => (
            <PostCard key={post.postId} post={post} />
        ))}

        {/* ✅ 무한 스크롤의 끝을 감지할 로더 요소 추가 */}
        {hasMore && (
            <div ref={loaderRef} className={styles.loader}>
              {loading && <p>로딩 중...</p>}
            </div>
        )}

        {/* 데이터가 없고 로딩이 끝났을 때 메시지 */}
        {!hasMore && posts.length === 0 && !loading && (
            <p className={styles.noPosts}>표시할 게시물이 없습니다.</p>
        )}
      </div>
  );
}