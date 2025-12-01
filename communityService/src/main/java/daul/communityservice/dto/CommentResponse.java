package daul.communityservice.dto;

import daul.communityservice.entity.comment.CommentEntity;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
  private Long commentId;
  private Long communityId;
  private String authorNickname;
  private String userId;
  private String content;
  private Long parentCommentId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private Boolean isDeleted;

  // 대댓글 목록 (계층 구조 표현용)
  private List<CommentResponse> replies;

  // Entity를 DTO로 변환 (대댓글 제외)
  public static CommentResponse from(CommentEntity entity) {
    return CommentResponse.builder()
        .commentId(entity.getCommentId())
        .communityId(entity.getCommunityId())
        .userId(entity.getUserId())
        .content(entity.getContent())
        .parentCommentId(entity.getParentCommentId())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .isDeleted(entity.getIsDeleted())
        .build();
  }

  // Entity를 DTO로 변환 (대댓글 포함)
  public static CommentResponse fromWithReplies(CommentEntity entity, List<CommentResponse> replies) {
    return CommentResponse.builder()
        .commentId(entity.getCommentId())
        .communityId(entity.getCommunityId())
        .userId(entity.getUserId())
        .content(entity.getContent())
        .parentCommentId(entity.getParentCommentId())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .isDeleted(entity.getIsDeleted())
        .replies(replies)
        .build();
  }
}