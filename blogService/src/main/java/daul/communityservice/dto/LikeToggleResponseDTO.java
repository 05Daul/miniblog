package daul.communityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LikeToggleResponseDTO {

  private boolean isLiked;
  private long likeCount;

}
