'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/blogService/commentSection.module.css';
import {
  createComment,
  updateComment,
  deleteComment,
  getCommentCount,
  getCommentsByPostId,
} from '@/api/blogService/comment';
import { CommentDTO } from '@/types/blogService/blogType';
import React from 'react'; // React import 추가

interface CommentSectionProps {
  postId: number;
  comments?: CommentDTO[]; // SSR용
}

// 날짜 포맷팅 유틸리티
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 🟢 [수정 완료된] 들여쓰기, 대댓글 접기/펼치기 기능을 추가한 CommentItem 컴포넌트
const CommentItem = ({
                       comment,
                       currentUserSignId,
                       replyingTo,
                       setReplyingTo,
                       editingCommentId,
                       setEditingCommentId,
                       onReply,
                       onEdit,
                       onDelete,
                       isLoading,
                       depth = 0 // 💡 depth prop 추가 (기본값 0)
                     }: {
  comment: CommentDTO;
  currentUserSignId: string;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  editingCommentId: number | null;
  setEditingCommentId: (id: number | null) => void;
  onReply: (parentId: number, content: string) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  depth?: number; // 💡 타입 정의 추가
}) => {
  // 입력 상태 관리
  const [localReplyContent, setLocalReplyContent] = useState('');
  const [localEditContent, setLocalEditContent] = useState('');

  // const [isRepliesVisible, setIsRepliesVisible] = useState(depth === 0);
  const [isRepliesVisible, setIsRepliesVisible] = useState(false);
  useEffect(() => {
    // 수정 폼이 열릴 때만 현재 댓글 내용을 localEditContent에 설정
    if (editingCommentId === comment.commentId) {
      setLocalEditContent(comment.content);
    }
  }, [editingCommentId, comment.commentId, comment.content]);

  // 삭제 핸들러 (API 호출 및 상태 업데이트)
  const handleDeleteComment = async (id: number) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    // setIsLoading은 CommentSection에서 관리하고 있으므로 여기서는 사용하지 않습니다.
    // CommentSection의 handleDelete에서 setIsLoading을 처리하도록 로직 변경
    try {
      // API 호출 (성공/실패만 판단)
      const res = await deleteComment(id, currentUserSignId);
      if (res.includes('권한')) return alert(res);
      // 상위 컴포넌트의 트리 삭제 로직 호출
      onDelete(id);
    } catch {
      alert('삭제 실패');
    }
  };

  // 답글 작성 핸들러
  const handleReplySubmit = () => {
    if (localReplyContent.trim() === '') {
      alert('답글 내용을 입력해주세요.');
      return;
    }
    // 답글 작성 후, 방금 작성한 답글을 보기 위해 isRepliesVisible을 true로 설정
    onReply(comment.commentId, localReplyContent);
    setReplyingTo(null);
    setLocalReplyContent('');
    setIsRepliesVisible(true); // 답글 작성 후 펼치기
  };

  // 수정 제출 핸들러
  const handleEditSubmit = () => {
    if (localEditContent.trim() === '') {
      alert('수정 내용을 입력해주세요.');
      return;
    }
    // 💡 onEdit 호출: TS2304 오류 해결의 핵심
    onEdit(comment.commentId, localEditContent);
    // 수정 완료는 상위 컴포넌트에서 로딩 완료 후 처리하는 것이 더 좋으나,
    // 여기서는 로딩 시작 즉시 폼을 닫습니다. (CommentSection에서 처리)
    // setEditingCommentId(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setLocalEditContent('');
  };

  // 💡 [수정] 댓글 컨테이너에 CSS 변수(--depth)를 사용하여 들여쓰기를 적용합니다.
  return (
      <div
          className={`${styles.commentItem} ${depth > 0 ? styles.replyItem : ''}`} // 대댓글은 replyItem 클래스 추가
          style={{ '--depth': depth } as React.CSSProperties} // CSS 변수 전달
      >
        <div className={styles.commentHeader}>
          <div className={styles.commentAvatar}>{comment.userId[0].toUpperCase()}</div>
          <div className={styles.info}>
            <span className={styles.commentAuthor}>{comment.userId}</span>
            <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        {editingCommentId === comment.commentId ? (
            <div className={styles.editForm}>
          <textarea
              value={localEditContent}
              onChange={e => setLocalEditContent(e.target.value)}
              rows={3}
              className={styles.commentTextarea}
              disabled={isLoading}
          />
              <div className={styles.actionButtons}>
                <button
                    onClick={handleEditSubmit}
                    className={styles.submitButton}
                    disabled={isLoading || localEditContent.trim() === ''}
                >
                  {isLoading ? '수정 중...' : '수정 완료'}
                </button>
                <button
                    onClick={handleCancelEdit}
                    className={styles.cancelButton}
                    disabled={isLoading}
                >
                  취소
                </button>
              </div>
            </div>
        ) : (
            <p className={styles.commentContent}>{comment.isDeleted ? '(삭제된 댓글입니다)' : comment.content}</p>
        )}

        {/* 액션 버튼들 */}
        {!comment.isDeleted && editingCommentId !== comment.commentId && (
            <div className={styles.commentActions}>
              <button
                  onClick={() => setReplyingTo(comment.commentId)}
                  className={styles.replyButton}
                  disabled={isLoading}
              >
                답글
              </button>
              {currentUserSignId === comment.userId && (
                  <>
                    <button
                        onClick={() => setEditingCommentId(comment.commentId)}
                        className={styles.editButton}
                        disabled={isLoading}
                    >
                      수정
                    </button>
                    <button
                        onClick={() => onDelete(comment.commentId)}
                        className={styles.deleteButton}
                        disabled={isLoading}
                    >
                      삭제
                    </button>
                  </>
              )}
            </div>
        )}

        {/* 💡 [수정] 대댓글 접기/펼치기 버튼 (댓글이 있고, 최상위 댓글이 아닌 경우에도 표시 가능) */}
        {comment.replies.length > 0 && (
            <div className={styles.replyToggle} onClick={() => setIsRepliesVisible(prev => !prev)}>
              {isRepliesVisible ? '답글 접기 ▲' : `답글 ${comment.replies.length}개 펼치기 ▼`}
            </div>
        )}

        {/* 답글 작성 폼 */}
        {replyingTo === comment.commentId && (
            <div className={styles.replyForm}>
          <textarea
              value={localReplyContent}
              onChange={e => setLocalReplyContent(e.target.value)}
              placeholder={`${comment.userId}님께 답글 작성`}
              rows={2}
              className={styles.commentTextarea}
              disabled={isLoading}
          />
              <div className={styles.actionButtons}>
                <button
                    onClick={handleReplySubmit}
                    className={styles.submitButton}
                    disabled={isLoading || localReplyContent.trim() === ''}
                >
                  {isLoading ? '작성 중...' : '답글 작성'}
                </button>
                <button
                    onClick={() => setReplyingTo(null)}
                    className={styles.cancelButton}
                    disabled={isLoading}
                >
                  취소
                </button>
              </div>
            </div>
        )}

        {/* 💡 [핵심] 대댓글 목록 렌더링 조건: isRepliesVisible이 true일 때만 렌더링 */}
        {comment.replies.length > 0 && isRepliesVisible && (
            <div className={styles.repliesList}>
              {comment.replies.map(r => (
                  // 💡 [핵심] 재귀 호출 시 depth를 1 증가시켜 전달
                  <CommentItem
                      key={r.commentId}
                      comment={r}
                      currentUserSignId={currentUserSignId}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}
                      editingCommentId={editingCommentId}
                      setEditingCommentId={setEditingCommentId}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isLoading={isLoading}
                      depth={depth + 1} // 💡 depth 증가
                  />
              ))}
            </div>
        )}
      </div>
  );
};


const updateTree = (list: CommentDTO[], id: number, fn: (c: CommentDTO) => CommentDTO): CommentDTO[] =>
    list.map(c =>
        c.commentId === id
            ? fn(c)
            : (c.replies && c.replies.length > 0)
                ? {
                  ...c,
                  replies: updateTree(c.replies, id, fn),
                }
                : c
    );

// 트리에서 댓글을 제거하는 유틸 (대댓글까지 제거될 경우 부모의 childCount도 업데이트)
const removeFromTree = (list: CommentDTO[], id: number): CommentDTO[] =>
    list.reduce((acc, c) => {
      if (c.commentId === id) {
        return acc;
      }

      let newReplies = c.replies;
      if (c.replies && c.replies.length > 0) {
        newReplies = removeFromTree(c.replies, id);
      }
      acc.push({ ...c, replies: newReplies });
      return acc;
    }, [] as CommentDTO[]);


export default function CommentSection({ postId, comments: ssrComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [currentUserSignId, setCurrentUserSignId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  // 🟢 isLoading 상태: TS2552 오류 해결을 위해 정의
  const [isLoading, setIsLoading] = useState(false);

  // 클라이언트에서만 실행 → 무조건 최신 데이터 + replies 매핑 보장
  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userSignId') || '' : '';
    setCurrentUserSignId(userId);

    const fetchData = async () => {
      setIsLoading(true); // 🟢 로딩 시작
      try {
        const fetchedComments = await getCommentsByPostId(postId);
        const fetchedCount = await getCommentCount(postId);
        // console.log("🔥 서버에서 받은 댓글 데이터 (배열):", fetchedComments);
        // console.log("🔥 최상위 댓글 개수:", fetchedComments.length);
        setComments(fetchedComments);
        setCommentCount(fetchedCount);
      } catch(e) {
        console.error("댓글 데이터 로드 실패", e);
      } finally {
        setIsLoading(false); // 🟢 로딩 종료
      }
    };
    fetchData();
  }, [postId]);

  // 최상위 댓글 작성
  const handleSubmitComment = async () => {
    if (newComment.trim() === '') {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    setIsLoading(true); // 🟢 로딩 시작
    try {
      const dto = { postId, parentCommentId: null, content: newComment };
      const newCmt = await createComment(currentUserSignId, dto);
      setComments(prev => [newCmt, ...prev]); // 최신 댓글을 맨 위에 추가
      setCommentCount(c => c + 1);
      setNewComment('');
    } catch {
      alert('댓글 작성 실패');
    } finally {
      setIsLoading(false); // 🟢 로딩 종료
    }
  };

  // 답글 작성 (CommentItem 내부에서 호출)
  const handleReply = async (parentId: number, content: string) => {
    setIsLoading(true); // 🟢 로딩 시작
    try {
      const dto = { postId, parentCommentId: parentId, content };
      const newCmt = await createComment(currentUserSignId, dto);

      // 답글이 달린 부모 댓글을 찾아 replies에 추가
      setComments(prev => updateTree(prev, parentId, c => ({
        ...c,
        replies: [...c.replies, newCmt],
        childCount: c.childCount + 1,
      })));

      setCommentCount(c => c + 1);
    } catch {
      alert('답글 작성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number, content: string) => {
    setIsLoading(true);
    try {
      const dto = { content };
      // API 호출
      const updatedCmt = await updateComment(id, currentUserSignId, dto);

      // 댓글 목록 업데이트
      setComments(prev => updateTree(prev, id, c => ({
        ...c,
        content: updatedCmt.content,
        updatedAt: updatedCmt.updatedAt
      })));

      // 수정 폼 닫기
      setEditingCommentId(null);
    } catch (e: any) {
      alert(e.message || '댓글 수정 실패');
      console.error(e);
    } finally {
      setIsLoading(false); // 🟢 로딩 종료
    }
  };

  // 댓글 삭제 (CommentItem에서 호출)
  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await deleteComment(id, currentUserSignId);
      if (res.includes('권한')) {
        alert(res);
        return;
      }

      const fetchedComments = await getCommentsByPostId(postId);
      const fetchedCount = await getCommentCount(postId);
      setComments(fetchedComments);
      setCommentCount(fetchedCount);

    } catch (e) {
      alert('댓글 삭제 실패');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.commentSection}>
        <h2 className={styles.commentTitle}>{commentCount}개의 댓글</h2>

        <div className={styles.commentForm}>
        <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="댓글을 작성하세요"
            rows={4}
            className={styles.commentTextarea}
            disabled={isLoading}
        />
          <button
              onClick={handleSubmitComment}
              className={styles.submitButton}
              disabled={isLoading || newComment.trim() === ''}
          >
            {isLoading ? '작성 중...' : '댓글 작성'}
          </button>
        </div>

        <div className={styles.commentList}>
          {comments.map(c => (
              <CommentItem
                  key={c.commentId}
                  comment={c}
                  currentUserSignId={currentUserSignId}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  editingCommentId={editingCommentId}
                  setEditingCommentId={setEditingCommentId}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                  depth={0}
              />
          ))}
        </div>
      </div>
  );
}