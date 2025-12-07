'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import styles from "@/styles/blogService/post.module.css";
import { getTrendingPosts, getRecentPosts, getFriendsPosts } from "@/api/blogService/blog";
import { PostEntity } from "@/types/blogService/blogType";
const PAGE_SIZE = 10;

interface PostListProps {
  postType: 'trending' | 'recent' |'friends';
}

export default function PostList({ postType }: PostListProps) {
  const [posts, setPosts] = useState<PostEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');


  const loaderRef = useRef<HTMLDivElement | null>(null);

  // loading 상태를 useRef로 관리하여 Observer 콜백에서 최신 값을 참조하도록 함
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  // hasMore 상태를 useRef로 관리하여 Observer 콜백에서 최신 값을 참조하도록 함
  const hasMoreRef = useRef(true);
  hasMoreRef.current = hasMore;


  // --- 0. 최초 마운트 시 사용자 ID 로드 ---
  useEffect(() => {
    const id = localStorage.getItem('userSignId');
    if (id) {
      setCurrentUserId(id);
    } else {
      console.error("User ID not found in localStorage. Cannot load friend posts.");
    }
  }, []);


  const loadPosts = useCallback(async (pageToLoad: number, currentPostType: 'trending' | 'recent' | 'friends') => {
    if (currentPostType === 'friends' && !currentUserId) return;
    if (loadingRef.current) return;

    setLoading(true);

    try {
      let res;
      if (currentPostType === 'trending') {
        res = await getTrendingPosts(pageToLoad, PAGE_SIZE);
      } else if (currentPostType === 'recent') {
        res = await getRecentPosts(pageToLoad, PAGE_SIZE);
      } else if (currentPostType === 'friends') {
        res = await getFriendsPosts(currentUserId, pageToLoad, PAGE_SIZE);
      } else {
        setLoading(false);
        return;
      }

      if (res?.content) {
        setPosts(prevPosts =>
            pageToLoad === 0 ? res.content! : [...prevPosts, ...res.content!]
        );
        setHasMore(!res.last);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Failed to fetch ${currentPostType} posts:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);


  // --- 1. postType 또는 currentUserId가 변경될 때 상태 초기화 및 첫 페이지 로드 ---
  useEffect(() => {
    if (postType === 'friends' && !currentUserId) {
      setPosts([]);
      setPage(0);
      setHasMore(true);
      setLoading(false);
      return;
    }

    setPosts([]);
    setPage(0);
    setHasMore(true);
    loadPosts(0, postType);
  }, [postType, currentUserId, loadPosts]);


  // --- 2. Intersection Observer 설정 (최종 보강 로직) ---
  useEffect(() => {
    if (!loaderRef.current || !hasMoreRef.current) return;

    const observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0];

          // isIntersecting 상태 확인 로그
          console.log(`[Observer Status] isIntersecting: ${target.isIntersecting}, loading: ${loadingRef.current}, hasMore: ${hasMoreRef.current}`);

          if (target.isIntersecting && !loadingRef.current && hasMoreRef.current) {
            console.log("✅ Intersection Observer: New page requested.");
            setPage(prevPage => prevPage + 1);
          }
        },
        {
          root: null,
          rootMargin: '20px',
          threshold: 1.0,
        }
    );

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
    // ✅ 로더 참조(loaderRef.current)와 hasMore 상태가 바뀔 때마다 재등록
  }, [loaderRef.current, hasMore]);


  // --- 3. page 상태 변화 감지 및 추가 로딩 (유지) ---
  useEffect(() => {
    if (page > 0) {
      loadPosts(page, postType);
    }
  }, [page, postType, loadPosts]);


  // --- 4. 렌더링 결과 ---
  return (
      // ✅ 최상위 div에 CSS 클래스 적용 (높이 확보를 위한 mainContentWrapper)
      <div className={styles.mainContentWrapper}>
        <div className={styles.postListContainer}>
          {posts.map(post => (
              <PostCard key={post.postId} post={post} />
          ))}
        </div>

        {/* 무한 스크롤의 끝을 감지할 로더 요소 */}
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