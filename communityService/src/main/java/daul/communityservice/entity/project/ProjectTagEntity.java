package daul.communityservice.entity.project;

import daul.communityservice.entity.CommunityTagEntity;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name="project_tags")
public class ProjectTagEntity {
  @EmbeddedId
  @AttributeOverrides({
      @AttributeOverride(name = "communityId", column = @Column(name = "community_id", nullable = false)),
      @AttributeOverride(name = "tagId", column = @Column(name = "tag_id", nullable = false))
  })
  private ProjectTagId projectTagId;
  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("communityId")
  @JoinColumn(name = "community_id")
  private ProjectEntity projectEntity; // ProjectPostEntity 연결

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("tagId")
  @JoinColumn(name = "tag_id")
  private CommunityTagEntity tag; // CommunityTagEntity 연결

}
