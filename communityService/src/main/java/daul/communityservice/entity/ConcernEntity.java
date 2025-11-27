package daul.communityservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Concern_entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConcernEntity extends BaseCommunityEntity {

  @Column(name = "is_resolved", nullable = false)
  private Boolean isResolved = false;

}
