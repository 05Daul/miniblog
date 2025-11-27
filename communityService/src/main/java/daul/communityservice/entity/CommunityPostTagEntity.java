package daul.communityservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "community_post_tags",
    uniqueConstraints = @UniqueConstraint(columnNames = {"community_id", "tag_id"}))
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class CommunityPostTagEntity {

  //복합키의 pk
  @EmbeddedId
  private CommunityPostTagId id;

  @Enumerated(EnumType.STRING)
  @Column(name = "community_type", nullable = false)
  private CommunityPostType communityType;

  // 생성 편의 메서드
  public static CommunityPostTagEntity create(BaseCommunityEntity post, CommunityTagEntity tag) {
    CommunityPostTagId id = new CommunityPostTagId(post.getCommunityId(), tag.getTagId());
    CommunityPostType type = determineType(post);

    CommunityPostTagEntity entity = new CommunityPostTagEntity();
    entity.id = id;
    entity.communityType = type;
    return entity;
  }
  private static CommunityPostType determineType(BaseCommunityEntity post) {
    if (post instanceof ProjectEntity) {
      return CommunityPostType.PROJECT;
    }
    if (post instanceof StudyEntity) {
      return CommunityPostType.STUDY;
    }
    if (post instanceof ConcernEntity) {
      return CommunityPostType.CONCERN;
    }
    throw new IllegalArgumentException("Unknown post type: " + post.getClass().getName());
  }

}