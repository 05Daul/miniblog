package daul.blogservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList; // List 사용을 위해 추가
import java.util.List;     // List 사용을 위해 추가
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity {

  /// 추후에 댓글 정렬 시 1) createdAt을 통해, 다만 같을 경우 2) commentID를 통해서 오류 제거

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long commentId;

  @Column(name = "post_id", nullable = false)
  private Long postId;

  @Column(name = "user_id", nullable = false)
  private String userId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id", nullable = true) // DB 컬럼 이름
  private CommentEntity parentComment;

  @OneToMany(mappedBy = "parentComment", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = false)
  private List<CommentEntity> childComments = new ArrayList<>();

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(nullable = true)
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  @Column(nullable = false)
  private Boolean isDeleted = false;

  public void addChildComment(CommentEntity child) {
    this.childComments.add(child);
    child.setParentComment(this);
  }

  public boolean isReply() {
    return this.parentComment != null;
  }

}