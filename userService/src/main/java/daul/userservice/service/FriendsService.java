package daul.userservice.service;

import daul.userservice.dto.FriendsResDto;
import java.util.List;

public interface FriendsService {

  FriendsResDto sendFriendRequest(String requesterSignId, String receiverSignId);

  FriendsResDto acceptFriendRequest(Long friendId, String receiverSignId);

  void deleteFriend(Long friendId, String userSignId);

  FriendsResDto blockUser(String blockerSignId, String blockedSignId);

  void unblockUser(Long friendId, String blockerSignId);

  List<FriendsResDto> getReceivedRequests(String userSignId);

  List<FriendsResDto> getSentRequests(String userSignId);

  List<FriendsResDto> getFriendsList(String userSignId);

  List<FriendsResDto> getBlockedList(String userSignId);

  FriendsResDto getFriendshipStatus(String userSignId, String targetUserSignId);

  void rejectFriendRequest(Long friendId, String receiverSignId);


  /// msa 통신용
  List<String> getMSAFriendSignIds(String userSignId);
}

