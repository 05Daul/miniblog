package daul.communityservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "community_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityTagEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long tagId;

  @Column(nullable = false, unique = true, length = 50)
  private String tagName;

  public static CommunityTagEntity of(String tagName) {
    CommunityTagEntity entity = new CommunityTagEntity();
    entity.setTagName(tagName);
    return entity;
  }

}
