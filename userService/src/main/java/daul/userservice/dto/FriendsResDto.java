package daul.userservice.dto;

import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.FriendsStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendsResDto {

  private Long friendId;
  private String requesterSignId;
  private String receiverSignId;
  private FriendsStatus friendsStatus;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public FriendsResDto(FriendsEntity entity) {
    this.friendId = entity.getFriendId();
    this.requesterSignId = entity.getRequester().getUserSignId();
    this.receiverSignId = entity.getReceiver().getUserSignId();
    this.friendsStatus = entity.getFriendsStatus();
    this.createdAt = entity.getCreatedAt();
    this.updatedAt = entity.getUpdatedAt();
  }
}
