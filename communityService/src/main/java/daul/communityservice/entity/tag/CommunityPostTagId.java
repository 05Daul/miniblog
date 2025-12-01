package daul.communityservice.entity.tag;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


//복합 키를 만들때 @Embeddable
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
@AllArgsConstructor
public class CommunityPostTagId implements Serializable {
  private Long communityId;
  private Long tagId;

}
