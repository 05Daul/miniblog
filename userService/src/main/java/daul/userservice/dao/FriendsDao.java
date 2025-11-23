package daul.userservice.dao;

import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.UsersEntity;
import java.util.Optional;

public interface FriendsDao {

  FriendsEntity saveFriendRequest(FriendsEntity friendsEntity);
  Optional<FriendsEntity> findExistingFriendship(UsersEntity user1, UsersEntity user2);
  Optional<FriendsEntity> findPendingFriendship(UsersEntity requester, UsersEntity receiver);
}
