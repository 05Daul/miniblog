package daul.communityservice.entity.comment;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import daul.communityservice.entity.tag.CommunityPostType;

@Entity
@Table(name = "community_comments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long commentId;

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Column(name = "user_id", nullable = false)
  private String userId;

  // 단방향: 자식이 부모를 참조만 함 (부모는 자식 목록을 가지지 않음)
  @Column(name = "parent_comment_id", nullable = true)
  private Long parentCommentId;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(nullable = true)
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  @Column(nullable = false)
  @Builder.Default
  private Boolean isDeleted = false;

  @Enumerated(EnumType.STRING)
  @Column(name = "community_type", nullable = false)
  private CommunityPostType communityType;

  // 대댓글인지 확인하는 유틸리티 메서드
  public boolean isReply() {
    return this.parentCommentId != null;
  }
}