'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import styles from "@/styles/blogService/post.module.css";
// ✅ getFriendsPosts를 포함하여 import
import { getTrendingPosts, getRecentPosts, getFriendsPosts } from "@/api/blogService/blog";
import { PostEntity } from "@/types/blogService/blogType";
const PAGE_SIZE = 10;

// Prop 타입 정의 유지
interface PostListProps {
  postType: 'trending' | 'recent' |'friends';
}

export default function PostList({ postType }: PostListProps) {
  const [posts, setPosts] = useState<PostEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // ✅ 친구 게시물 조회에 필요한 currentUserId 상태 추가
  const [currentUserId, setCurrentUserId] = useState<string>('');


  const loaderRef = useRef<HTMLDivElement | null>(null);

  const pageRef = useRef(0);
  pageRef.current = page;
  const hasMoreRef = useRef(true);
  hasMoreRef.current = hasMore;

  // --- 0. 최초 마운트 시 사용자 ID 로드 ---
  useEffect(() => {
    const id = localStorage.getItem('userSignId');
    if (id) {
      setCurrentUserId(id);
    } else {
      // ID가 없으면 'friends' 타입은 로드할 수 없으므로 에러 처리나 기본 동작 설정이 필요합니다.
      console.error("User ID not found in localStorage. Cannot load friend posts.");
    }
  }, []);


  const loadPosts = useCallback(async (pageToLoad: number, currentPostType: 'trending' | 'recent' | 'friends') => {
    if (currentPostType === 'friends' && !currentUserId) return; // ID가 없으면 로드 중단

    setLoading(true);

    try {
      // ✅ postType에 따른 적절한 fetch 함수 선택
      let res;
      if (currentPostType === 'trending') {
        res = await getTrendingPosts(pageToLoad, PAGE_SIZE);
      } else if (currentPostType === 'recent') {
        res = await getRecentPosts(pageToLoad, PAGE_SIZE);
      } else if (currentPostType === 'friends') {
        // ✅ getFriendsPosts는 userSignId를 첫 번째 인자로 받습니다.
        res = await getFriendsPosts(currentUserId, pageToLoad, PAGE_SIZE);
      } else {
        setLoading(false);
        return;
      }

      if (res?.content) {
        setPosts(prevPosts =>
            pageToLoad === 0 ? res.content! : [...prevPosts, ...res.content!]
        );
        // last가 false일 경우에만 hasMore를 true로 유지
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
  }, [currentUserId]); // ✅ loadPosts의 의존성 배열에 currentUserId 추가


  // --- 1. postType 또는 currentUserId가 변경될 때 상태 초기화 및 첫 페이지 로드 ---
  useEffect(() => {
    if (postType === 'friends' && !currentUserId) return; // friends 타입인데 ID가 없으면 로드하지 않음

    setPosts([]);
    setPage(0);
    setHasMore(true);
    setLoading(false);
    loadPosts(0, postType);
  }, [postType, currentUserId, loadPosts]); // ✅ currentUserId를 의존성 배열에 추가


  // --- 2. Intersection Observer 설정 (로직 수정 없이 유지) ---
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
  }, [loading]);


  // --- 3. page 상태 변화 감지 및 추가 로딩 (유지) ---
  useEffect(() => {
    if (page > 0) {
      loadPosts(page, postType);
    }
  }, [page, postType, loadPosts]);


  // --- 4. 렌더링 결과 ---
  return (
      <div className={styles.postListContainer}>
        {posts.map(post => (
            <PostCard key={post.postId} post={post} />
        ))}

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