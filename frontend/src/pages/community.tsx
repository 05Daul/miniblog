// src/pages/community.tsx
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Layout from '@/component/layout/MainLayout';
import styles from '@/styles/community/CommunityMain.module.css';
import {getConcernList, getProjectList, getStudyList, Page} from '@/api/communityService/community';
import {getLikeCount, toggleLike, checkLike} from '@/api/communityService/like';
import {getCommentCount} from '@/api/communityService/comment';
import {getTags} from '@/api/communityService/tag';
import {
  CommunityPost,
  CommunityPostType,
  RecruitmentStatus
} from '@/types/communityService/communityType';
import {useInView} from 'react-intersection-observer';

type TabType = 'all' | 'concern' | 'project' | 'study';

/*interface ExtendedPostSummary { ... } // ⭐️ [삭제 완료] */

export default function Community() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  // ⭐️ [확인] CommunityPost[]로 설정 완료
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(0); // 다음으로 로드할 페이지 인덱스 (0부터 시작)
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userSignId, setUserSignId] = useState<string>('');
  const [ref, inView] = useInView({threshold: 0.5, triggerOnce: false});

  const tabs = [
    {id: 'all' as TabType, label: '전체', emoji: 'All'},
    {id: 'concern' as TabType, label: '고민있어요', emoji: 'Thought'},
    {id: 'project' as TabType, label: '프로젝트', emoji: 'Rocket'},
    {id: 'study' as TabType, label: '스터디', emoji: 'Book'},
  ];

  useEffect(() => {
    setUserSignId(localStorage.getItem('userSignId') || '');
  }, []);

  // ----------------------------------------------------------------------------------
  // 1. 단일 탭 데이터 요청 및 처리 함수 (API 호출 + 좋아요/댓글/태그 정보 추가)
  // ----------------------------------------------------------------------------------
  // ⭐️ [확인] 반환 타입이 { posts: CommunityPost[], ... } 로 정확히 설정됨
  const fetchAndProcessPosts = async (tab: TabType, pageNum: number): Promise<{
    posts: CommunityPost[],
    totalPages: number
  }> => {
    try {
      let response: Page<any>;
      let postType: CommunityPostType;

      switch (tab) {
        case 'concern':
          response = await getConcernList(pageNum, 10);
          postType = CommunityPostType.CONCERN;
          break;
        case 'project':
          response = await getProjectList(pageNum, 10);
          postType = CommunityPostType.PROJECT;
          break;
        case 'study':
          response = await getStudyList(pageNum, 10);
          postType = CommunityPostType.STUDY;
          break;
        default:
          return {posts: [], totalPages: 0};
      }

      if (!response?.content) return {posts: [], totalPages: 0};

      const extendedPosts = await Promise.all(
          response.content.map(async (post: any) => {
            const [likeCount, commentCount, isLiked, tags] = await Promise.all([
              getLikeCount(postType, post.communityId).catch(() => 0),
              getCommentCount(postType, post.communityId).catch(() => 0),
              userSignId ? checkLike(postType, post.communityId, userSignId).catch(() => false) : false,
              getTags(post.communityId).catch(() => [])
            ]);

            return {
              ...post,
              postType,
              likeCount,
              commentCount,
              isLiked,
              tags,
              status: post.status as RecruitmentStatus, // 모집 상태
              deadline: post.deadline, // 프로젝트 마감일
              startDate: post.startDate, // 스터디 시작일
            };
          })
      );

      return {posts: extendedPosts, totalPages: response.totalPages};
    } catch (error) {
      console.error(`[fetchAndProcessPosts] ${tab} 로딩 실패:`, error);
      return {posts: [], totalPages: 0};
    }
  };

  // ----------------------------------------------------------------------------------
  // 2. 중앙 데이터 로딩 및 상태 업데이트 함수 (중복 로딩 방지 로직 포함)
  // ----------------------------------------------------------------------------------
  const loadData = async (targetPage: number, tab: TabType) => {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 요청하지 않음
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      // ⭐️ [수정] fetchedPosts 타입을 CommunityPost[]로 명시합니다.
      let fetchedPosts: CommunityPost[] = [];
      let totalPages = 0;

      if (tab !== 'all') {
        // Case 1: Single Tab (Concern, Project, Study)
        const result = await fetchAndProcessPosts(tab, targetPage);
        fetchedPosts = result.posts;
        totalPages = result.totalPages;
      } else {
        // Case 2: 'all' Tab (모든 탭에서 데이터를 가져와 병합)
        const [concerns, projects, studies] = await Promise.all([
          fetchAndProcessPosts('concern', targetPage),
          fetchAndProcessPosts('project', targetPage),
          fetchAndProcessPosts('study', targetPage)
        ]);

        fetchedPosts = [
          ...concerns.posts,
          ...projects.posts,
          ...studies.posts,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // totalPages는 셋 중 가장 큰 값 또는 페이지가 남아있는지 여부를 판단하는 근사치 사용
        totalPages = Math.max(concerns.totalPages, projects.totalPages, studies.totalPages);
      }

      if (fetchedPosts.length > 0) {
        setPosts(prev => {
          // ⭐️ [핵심 수정] 중복 게시글 필터링 로직
          const existingIds = new Set(prev.map(p => `${p.postType}-${p.communityId}`));
          const filteredNewPosts = fetchedPosts.filter(p => !existingIds.has(`${p.postType}-${p.communityId}`));

          // 페이지 0(초기 로드 또는 탭 변경)인 경우, 기존 게시글을 덮어씁니다.
          const finalPosts = targetPage === 0 ? filteredNewPosts : [...prev, ...filteredNewPosts];

          return finalPosts;
        });

        // ⭐️ [핵심 수정] 성공적으로 데이터를 로드한 후에만 페이지 인덱스 업데이트
        setPage(targetPage + 1);
        setHasMore(targetPage + 1 < totalPages);

      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------------------
  // 3. Effect for Tab Change (Initial Load: Page 0)
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    // ⭐️ [수정] 탭 변경 시 상태 초기화 및 페이지 0 로드 요청
    setPosts([]);
    setPage(0);
    setHasMore(true);
    // Strict Mode에서 두 번 호출되지만, loadData 내부의 isLoading 체크와 중복 필터링으로 해결
    loadData(0, activeTab);
  }, [activeTab, userSignId]);

  // ----------------------------------------------------------------------------------
  // 4. Effect for Infinite Scroll (Load Next Page)
  // ----------------------------------------------------------------------------------
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      // ✅ inView일 때, 현재 page 상태(다음 로드할 페이지 번호)를 사용하여 데이터 로드
      loadData(page, activeTab);
    }
  }, [inView, hasMore, isLoading]); // page 상태 변화에 직접 의존하지 않아 무한 루프 위험 방지

  const handleLikeToggle = async (post: CommunityPost) => {
    if (!userSignId) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const newIsLiked = await toggleLike(post.postType, post.communityId, userSignId);
      setPosts(prevPosts => prevPosts.map(p =>
          p.communityId === post.communityId && p.postType === post.postType
              ? {...p, isLiked: newIsLiked, likeCount: p.likeCount + (newIsLiked ? 1 : -1)}
              : p
      ));
    } catch (error) {
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // 유효하지 않은 날짜 처리
      return '날짜 오류';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  };

  // HTML 태그 제거 및 안전한 텍스트 추출
  const getPlainText = (html: string | null | undefined): string => {
    if (!html) return '내용 없음';
    try {
      // 브라우저 환경에서 DOM 파싱을 통해 안전하게 텍스트 추출
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const text = tmp.textContent || tmp.innerText || '';
      return text.trim() || '내용 없음';
    } catch {
      return '내용 없음';
    }
  };

  const getBadgeStyle = (type: CommunityPostType) => {
    switch (type) {
      case CommunityPostType.CONCERN:
        return styles.badgeConcern;
      case CommunityPostType.PROJECT:
        return styles.badgeProject;
      case CommunityPostType.STUDY:
        return styles.badgeStudy;
      default:
        return styles.badgeConcern;
    }
  };

  return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.tabContainer}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                >
                  <span className={styles.tabEmoji}>{tab.emoji}</span>
                  {tab.label}
                </button>
            ))}
          </div>

          <div className={styles.grid}>
            {posts.map(post => {
              const postTypeLabel = post.postType === CommunityPostType.CONCERN ? '고민' :
                  post.postType === CommunityPostType.PROJECT ? '프로젝트' :
                      '스터디';

              const badgeClass = post.postType === CommunityPostType.CONCERN ? styles.badgeConcern :
                  post.postType === CommunityPostType.PROJECT ? styles.badgeProject :
                      styles.badgeStudy;

              if (post.postType === CommunityPostType.PROJECT || post.postType === CommunityPostType.STUDY) {
                console.log(`Post ID: ${post.communityId}, Status: ${post.status}, Deadline: ${post.deadline}, StartDate: ${post.startDate}`);
              }

              const plainText = getPlainText(post.content);
              const excerpt = plainText.length > 100
                  ? plainText.substring(0, 100) + '...'
                  : plainText;

              return (
                  <Link
                      key={`${post.postType}-${post.communityId}`} // ⭐️ [확인] key는 고유하게 postType과 communityId를 조합하여 사용
                      href={`/community/${post.postType.toLowerCase()}/${post.communityId}`}
                      className={styles.cardLink}
                  >
                    <article className={styles.card}>
                      {/* ⭐️ [수정] 날짜 정보를 포함할 새로운 컨테이너 (cardHeader) 추가 ⭐️ */}
                      <div className={styles.cardHeader}>
                        <div className={styles.badgeContainer}>
                          {/* 1. 타입 뱃지 (기존 위치) */}
                          <span className={`${styles.badge} ${badgeClass}`}>{postTypeLabel}</span>

                          {/* 2. 모집 상태 뱃지 (기존 위치) */}
                          {(post.postType === CommunityPostType.PROJECT || post.postType === CommunityPostType.STUDY) && post.status && (
                              <span
                                  className={`${styles.statusBadge} ${post.status === RecruitmentStatus.RECRUITING ? styles.statusRecruiting : styles.statusClosed}`}>
                        {post.status === RecruitmentStatus.RECRUITING ? '모집중' : '마감'}
                    </span>
                          )}
                        </div>

                        {/* ⭐️ 3. 시작일/마감일 정보를 cardHeader의 우측으로 이동 ⭐️ */}
                        {(post.postType === CommunityPostType.PROJECT || post.postType === CommunityPostType.STUDY) && (
                            <div className={styles.dateRight}>
                              {/* 프로젝트 마감일 */}
                              {post.postType === CommunityPostType.PROJECT && post.deadline && (
                                  <span className={styles.dateInfo}>
                            마감일: {formatDate(post.deadline)}
                        </span>
                              )}
                              {/* 스터디 시작일 */}
                              {post.postType === CommunityPostType.STUDY && post.startDate && (
                                  <span className={styles.dateInfo}>
                            시작일: {formatDate(post.startDate)}
                        </span>
                              )}
                            </div>
                        )}
                      </div>
                      <h3 className={styles.cardTitle}>{post.title || '제목 없음'}</h3>
                      <p className={styles.cardExcerpt}>{excerpt}</p>
                      <div className={styles.tags}>
                        {post.tags && post.tags.length > 0 && post.tags.map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                      <div className={styles.cardFooter}>
                        <div className={styles.authorInfo}>
                          <span className={styles.author}>{post.authorNickname || '익명'}</span>
                          <span className={styles.time}>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className={styles.stats}>
                          <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleLikeToggle(post);
                              }}
                              className={`${styles.likeButton} ${post.isLiked ? styles.liked : ''}`}
                          >
                            좋아요 {post.likeCount || 0}
                          </button>
                          <span>댓글 {post.commentCount || 0}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
              );
            })}
          </div>

          <div ref={ref} className={styles.loadMore}>
            {!hasMore && posts.length > 0}
          </div>

          <Link href="/community/write" className={styles.fab}>
            + 글쓰기
          </Link>
        </div>
      </Layout>
  );
}