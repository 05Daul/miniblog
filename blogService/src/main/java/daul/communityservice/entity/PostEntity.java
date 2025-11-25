package daul.communityservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long postId;

  @Column(name = "author_id", nullable = false)
  private String authorId;
  /// userSignId 랑 같이 사용.

  @Column(nullable = false, length = 254)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = true)
  private String thumbnail;

  @Column(nullable = false)
  private Boolean isPublished = true;

  @Column(nullable = false)
  private Integer viewCount = 0;

  @Column(nullable = false, updatable = false)
  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(nullable = true)
  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public void setPost(String authorId, String title,
      String content, Boolean isPublished, String thumbnail) {
    this.authorId = authorId;
    this.title = title;
    this.content = content;
    this.isPublished = isPublished;
    this.thumbnail = thumbnail;
  }


  /// 조회수 처리 -> 동시성 처리 필요
  public void incrementViewCount() {
    this.viewCount++;
  }



}