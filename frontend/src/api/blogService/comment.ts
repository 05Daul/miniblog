// @/api/blogService/comment.ts
import { BLOGSERVICE_API } from "../../config/env";
import { CommentCreationRequestDTO, CommentDTO, CommentUpdateRequestDTO } from "../../types/blogService/blogType";

export async function createComment(userSignId: string, dto: CommentCreationRequestDTO): Promise<CommentDTO> {
  const res = await fetch(`${BLOGSERVICE_API}/comments`, {
    method: "POST",
    headers: { "userSignId": userSignId, "Content-Type": "application/json" },
    body: JSON.stringify({ postId: dto.postId, content: dto.content, parentId: dto.parentCommentId }),
  });
  if (!res.ok) throw new Error("댓글 작성 실패");
  return mapToReplies(await res.json());
}

export async function updateComment(commentId: number, userSignId: string, dto: CommentUpdateRequestDTO): Promise<CommentDTO> {
  const res = await fetch(`${BLOGSERVICE_API}/comments/${commentId}`, {
    method: "PUT",
    headers: { "userSignId": userSignId, "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("수정 실패");
  return mapToReplies(await res.json());
}

export async function deleteComment(commentId: number, userSignId: string): Promise<string> {
  const res = await fetch(`${BLOGSERVICE_API}/comments/${commentId}`, { method: "DELETE", headers: { "userSignId": userSignId } });
  if (res.status === 403) return "권한이 없습니다.";
  if (!res.ok) throw new Error("삭제 실패");
  return await res.text();
}

export async function getCommentCount(postId: number): Promise<number> {
  const res = await fetch(`${BLOGSERVICE_API}/comments/count?postId=${postId}`);
  if (!res.ok) return 0;
  return parseInt(await res.text(), 10);
}


function mapToReplies(comment: any): CommentDTO {
  return {
    commentId: comment.commentId,
    postId: comment.postId,
    userId: comment.userId,
    parentId: comment.parentId ?? null,
    content: comment.isDeleted ? "(삭제된 댓글)" : comment.content,
    isDeleted: comment.isDeleted ?? false,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    childCount: comment.childCount ?? 0,
    replies: comment.childComments && comment.childComments.length > 0
        ? comment.childComments.map(mapToReplies)
        : [],
  };
}

export async function getCommentsByPostId(postId: number): Promise<CommentDTO[]> {
  const res = await fetch(`${BLOGSERVICE_API}/comments?postId=${postId}`);
  if (!res.ok) return [];

  const raw: any[] = await res.json();
  return raw.map(mapToReplies);
}