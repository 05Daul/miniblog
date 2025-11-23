package daul.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class FriendReqDto {

  @NonNull
  private final String receiverSignId;

}
