package daul.communityservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "community_likes", uniqueConstraints = {
    // postId + userSignId + communityType 의 조합이 유일해야 중복 좋아요를 방지
    @UniqueConstraint(columnNames = {"community_id", "user_sign_id", "community_type"})
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long likeId;

  @Column(name = "user_sign_id", nullable = false)
  private String userSignId;

  @Column(name = "community_id", nullable = false)
  private Long communityId;

  @Enumerated(EnumType.STRING)
  @Column(name = "community_type", nullable = false)
  private CommunityPostType communityType;

  @CreationTimestamp
  private LocalDateTime createdAt;

  @Column(nullable = true)
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}


