package daul.userservice.service;

import daul.userservice.dto.FriendReqDto;
import daul.userservice.dto.FriendsResDto;
import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import java.util.Map;

public interface UserService {
  void signUp(UsersDTO usersDTO);
  Map<String, String> login(LoginDTO loginDTO);
  FriendsResDto requestFriend(String requesterSignId, FriendReqDto dto);
  FriendsResDto acceptFriend(String receiverSignId, String requesterSignId);

}
