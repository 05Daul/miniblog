// src/pages/community/[type]/[id].tsx
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Layout from '@/component/layout/MainLayout';
import styles from '@/styles/community/PostDetail.module.css';
import {
  getConcernDetail,
  getProjectDetail,
  getStudyDetail,
  deleteConcern,
  deleteProject,
  deleteStudy,
} from '@/api/communityService/community';
import {toggleLike, checkLike, getLikeCount} from '@/api/communityService/like';
import {
  getComments,
  createComment,
  getCommentCount,
  updateComment,
  deleteComment
} from '@/api/communityService/comment';
import {getTags} from '@/api/communityService/tag';
import {
  PostDetailResponse,
  CommunityPostType,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest // ⭐️ [수정] 댓글 수정을 위한 요청 타입이 있다고 가정
} from '@/types/communityService/communityType';

export default function PostDetail() {
  const router = useRouter();
  const {type, id} = router.query;

  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userSignId, setUserSignId] = useState<string>('');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // ⭐️ [추가] 댓글 수정 상태 ⭐️
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    setUserSignId(localStorage.getItem('userSignId') || '');
  }, []);

  useEffect(() => {
    if (type && id) {
      loadPostDetail();
    }
  }, [type, id, userSignId]);

  const loadPostDetail = async () => {
    if (!type || !id) return;

    setIsLoading(true);
    try {
      const communityId = Number(id);
      const postType = (type as string).toUpperCase() as CommunityPostType;

      let postData: PostDetailResponse;

      switch (postType) {
        case CommunityPostType.CONCERN:
          postData = await getConcernDetail(communityId, userSignId);
          break;
        case CommunityPostType.PROJECT:
          postData = await getProjectDetail(communityId, userSignId);
          break;
        case CommunityPostType.STUDY:
          postData = await getStudyDetail(communityId, userSignId);
          break;
        default:
          throw new Error('Invalid post type');
      }

      setPost(postData);

      // 좋아요 상태와 개수 로드
      // 🚨 [에러 수정 1] getCommentCount의 인자 순서 수정: (type, communityId)가 아닌 (communityId, type) 순서였습니다.
      const [liked, count, tagsData, commentsData, countData] = await Promise.all([
        checkLike(postType, communityId, userSignId),
        getLikeCount(postType, communityId),
        getTags(communityId),
        getComments(postType, communityId),
        getCommentCount(postType, communityId), // 👈 인자 순서 변경
      ]);

      setIsLiked(liked);
      setLikeCount(count);
      setTags(tagsData);
      setComments(commentsData);
      setCommentCount(countData);

    } catch (error) {
      console.error('Failed to load post detail:', error);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!userSignId || !post || !type || !id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const postType = (type as string).toUpperCase() as CommunityPostType;
      await toggleLike(postType, Number(id), userSignId);
      setIsLiked(prev => !prev);
      setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!userSignId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    if (!type || !id) return;

    try {
      const postType = (type as string).toUpperCase() as CommunityPostType;
      const communityId = Number(id);
      const request: CreateCommentRequest = {content: commentContent};
      await createComment(postType, communityId, request, userSignId);
      setCommentContent('');

      // 댓글 목록 및 카운트 새로고침
      const [updatedComments, countData] = await Promise.all([
        getComments(postType, communityId),
        getCommentCount(postType, communityId), // 👈 인자 순서 변경
      ]);
      setComments(updatedComments);
      setCommentCount(countData);

    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
      console.error('Create comment failed:', error);
    }
  };

  const handleReplySubmit = async (parentCommentId: number) => {
    if (!userSignId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }
    if (!type || !id) return;

    try {
      const postType = (type as string).toUpperCase() as CommunityPostType;
      const communityId = Number(id);
      const request: CreateCommentRequest = {
        content: replyContent,
        parentCommentId: parentCommentId,
      };
      await createComment(postType, communityId, request, userSignId);
      setReplyContent('');
      setReplyTo(null);

      // 댓글 목록 및 카운트 새로고침
      const [updatedComments, countData] = await Promise.all([
        getComments(postType, communityId),
        getCommentCount(postType, communityId), // 👈 인자 순서 변경
      ]);
      setComments(updatedComments);
      setCommentCount(countData);

    } catch (error) {
      alert('답글 작성에 실패했습니다.');
      console.error('Create reply failed:', error);
    }
  };

  // ⭐️ [추가] 댓글 삭제 핸들러 ⭐️
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    if (!type || !id || !userSignId) return;

    try {
      const postType = (type as string).toUpperCase() as CommunityPostType;
      const communityId = Number(id);

      // 🚨 댓글 삭제 API 호출
      await deleteComment(postType, communityId, commentId, userSignId);

      // 삭제 후 댓글 목록 및 카운트 새로고침
      const [updatedComments, countData] = await Promise.all([
        getComments(postType, communityId),
        getCommentCount(postType, communityId), // 👈 인자 순서 변경
      ]);
      setComments(updatedComments);
      setCommentCount(countData);

    } catch (error) {
      alert('댓글 삭제에 실패했습니다. (자신의 댓글만 삭제할 수 있습니다)');
      console.error('Delete comment failed:', error);
    }
  };

  // ⭐️ [추가] 댓글 수정 핸들러 ⭐️
  const handleEditComment = async (commentId: number) => {
    if (!editedContent.trim()) {
      alert('수정할 내용을 입력해주세요.');
      return;
    }
    if (!type || !id || !userSignId) return;

    try {
      const postType = (type as string).toUpperCase() as CommunityPostType;
      const communityId = Number(id);
      const request: UpdateCommentRequest = { // UpdateCommentRequest 사용 가정
        content: editedContent
      };

      // 🚨 댓글 수정 API 호출
      await updateComment(postType, communityId, commentId, request, userSignId);

      setEditingCommentId(null);
      setEditedContent('');

      // 수정 후 댓글 목록 새로고침
      const updatedComments = await getComments(postType, communityId);
      setComments(updatedComments);

    } catch (error) {
      alert('댓글 수정에 실패했습니다. (자신의 댓글만 수정할 수 있습니다)');
      console.error('Edit comment failed:', error);
    }
  };

  const formatTime = (isoString: string) => {
    // 간단한 시간 포맷팅 로직
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '방금 전'; // 1분 미만
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`; // 1시간 미만
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`; // 24시간 미만

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '').replace(' ', ' ');
  };
  const renderComments = (comments: CommentResponse[]) => {
    // 디버깅용: 서버에서 어떤 데이터가 오는지 확인 (나중에 배포 시 삭제 가능)
    console.log('[댓글 전체 데이터]', comments);

    return comments.map(comment => {
      // 개별 댓글 로그 (대댓글 포함)
      console.log('[개별 댓글]', {
        commentId: comment.commentId,
        userId: comment.userId,
        authorNickname: comment.authorNickname,
        content: comment.content,
        isDeleted: comment.isDeleted,
        parentCommentId: comment.parentCommentId,
      });

      // 작성자 표시 로직: 닉네임 있으면 닉네임 → authorId → 익명
      const displayName = comment.authorNickname
          ? comment.authorNickname
          : comment.userId
              ? comment.userId
              : '익명';

      return (
          <div
              key={comment.commentId}
              className={comment.parentCommentId === null ? styles.comment : styles.reply}
          >
            {editingCommentId === comment.commentId ? (
                // 수정 폼
                <div className={styles.replyInput}>
              <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="댓글을 수정하세요..."
                  className={styles.textarea}
              />
                  <div className={styles.replyButtons}>
                    <button onClick={() => setEditingCommentId(null)} className={styles.cancelButton}>
                      취소
                    </button>
                    <button
                        onClick={() => handleEditComment(comment.commentId)}
                        className={styles.submitButton}
                    >
                      수정 완료
                    </button>
                  </div>
                </div>
            ) : (
                <>
                  <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>
                  {comment.isDeleted ? '삭제된 사용자' : displayName}
                </span>
                    <span className={styles.commentTime}>{formatTime(comment.createdAt)}</span>

                    {/* 본인 댓글인지 확인 → 수정/삭제 버튼 노출 */}
                    {comment.userId === userSignId && !comment.isDeleted && (
                        <div className={styles.commentActions}>
                          <button
                              onClick={() => {
                                setEditingCommentId(comment.commentId);
                                setEditedContent(comment.content);
                              }}
                              className={styles.actionButton}
                          >
                            수정
                          </button>
                          <button
                              onClick={() => handleDeleteComment(comment.commentId)}
                              className={styles.actionButton}
                          >
                            삭제
                          </button>
                        </div>
                    )}
                  </div>

                  <p className={styles.commentContent}>
                    {comment.isDeleted ? '삭제된 댓글입니다.' : comment.content}
                  </p>

                  {/* 답글 달기 버튼 */}
                  {!comment.isDeleted && (
                      <button
                          className={styles.replyButton}
                          onClick={() => {
                            setReplyTo(comment.commentId);
                            setReplyContent('');
                          }}
                      >
                        답글
                      </button>
                  )}
                </>
            )}

            {/* 답글 입력 폼 */}
            {replyTo === comment.commentId && (
                <div className={styles.replyInput}>
              <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className={styles.textarea}
              />
                  <div className={styles.replyButtons}>
                    <button onClick={() => setReplyTo(null)} className={styles.cancelButton}>
                      취소
                    </button>
                    <button
                        onClick={() => handleReplySubmit(comment.commentId)}
                        className={styles.submitButton}
                    >
                      작성
                    </button>
                  </div>
                </div>
            )}

            {/* 대댓글 재귀 렌더링 */}
            {comment.replies && comment.replies.length > 0 && (
                <div className={styles.repliesContainer}>
                  {renderComments(comment.replies)}
                </div>
            )}
          </div>
      );
    });
  };
  const handlePostDelete = async () => {
    if (!post || !type || !id) return;
    if (!confirm('정말로 게시글을 삭제하시겠습니까?')) return;

    try {
      const communityId = Number(id);
      const postType = (type as string).toUpperCase() as CommunityPostType;

      switch (postType) {
        case CommunityPostType.CONCERN:
          await deleteConcern(communityId, userSignId);
          break;
        case CommunityPostType.PROJECT:
          await deleteProject(communityId, userSignId);
          break;
        case CommunityPostType.STUDY:
          await deleteStudy(communityId, userSignId);
          break;
        default:
          throw new Error('Invalid post type');
      }

      alert('게시글이 삭제되었습니다.');
      router.push('/community');
    } catch (error) {
      alert('게시글 삭제에 실패했습니다. (작성자만 삭제할 수 있습니다)');
      console.error('Delete post failed:', error);
    }
  };

  const handlePostEdit = () => {
    if (!post || !type || !id) return;
    router.push(`/community/write?type=${type}&id=${id}`);
  };


  if (isLoading) {
    return (
        <Layout>
          <div className={styles.loading}>로딩 중...</div>
        </Layout>
    );
  }

  if (!post) {
    return (
        <Layout>
          <div className={styles.error}>게시글을 찾을 수 없습니다.</div>
        </Layout>
    );
  }

  const badgeClass = {
    [CommunityPostType.CONCERN]: styles.badgeConcern,
    [CommunityPostType.PROJECT]: styles.badgeProject,
    [CommunityPostType.STUDY]: styles.badgeStudy,
  }[post.postType!];

  const postTypeLabel = {
    [CommunityPostType.CONCERN]: '고민 상담',
    [CommunityPostType.PROJECT]: '프로젝트',
    [CommunityPostType.STUDY]: '스터디',
  }[post.postType!];

  return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.post}>
            <div className={styles.postHeader}>
              <span className={`${styles.badge} ${badgeClass}`}>{postTypeLabel}</span>
              {post.userId === userSignId && (
                  <div className={styles.actions}>
                    <button onClick={handlePostEdit} className={styles.editButton}>
                      수정
                    </button>
                    <button onClick={handlePostDelete} className={styles.deleteButton}>
                      삭제
                    </button>
                  </div>
              )}
            </div>

            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.authorInfo}>
              <span className={styles.author}>{post.authorNickname || '익명'}</span>
              <span className={styles.time}>{formatTime(post.createdAt)}</span>
            </div>

            <div className={styles.tags}>
              {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
              ))}
            </div>

            <div
                className={styles.content}
                dangerouslySetInnerHTML={{__html: post.content}}
            />

            <div className={styles.stats}>
              <button
                  onClick={handleLikeToggle}
                  className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
              >
                ❤️ 좋아요 {likeCount}
              </button>
              <span className={styles.commentStat}>💬 댓글 {commentCount}</span>
            </div>
          </div>

          <div className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>댓글 {commentCount}</h2>

            {userSignId && (
                <div className={styles.commentInput}>
              <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className={styles.textarea}
              />
                  <button
                      onClick={handleCommentSubmit}
                      className={styles.submitButton}
                  >
                    작성
                  </button>
                </div>
            )}

            <div className={styles.commentsList}>
              {renderComments(comments)}
            </div>
          </div>

          <button
              onClick={() => router.push('/community')}
              className={styles.backButton}
          >
            목록으로
          </button>
        </div>
      </Layout>
  );
}