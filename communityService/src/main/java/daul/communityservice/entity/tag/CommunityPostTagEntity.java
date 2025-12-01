package daul.communityservice.entity.tag;

import daul.communityservice.entity.BaseCommunityEntity;
import daul.communityservice.entity.concern.ConcernEntity;
import daul.communityservice.entity.project.ProjectEntity;
import daul.communityservice.entity.study.StudyEntity;
import jakarta.persistence.*;
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

  // 복합키의 PK
  @EmbeddedId
  private CommunityPostTagId id;

  @Enumerated(EnumType.STRING)
  @Column(name = "community_type", nullable = false)
  private CommunityPostType communityType;

  // 생성 편의 메서드
  public static CommunityPostTagEntity create(BaseCommunityEntity post, Long tagId) {
    CommunityPostTagId id = new CommunityPostTagId(post.getCommunityId(), tagId);
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
    throw new IllegalArgumentException("Unknown post type");
  }
}