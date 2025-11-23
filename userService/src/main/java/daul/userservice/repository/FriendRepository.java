package daul.userservice.repository;

import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.FriendsStatus;
import daul.userservice.entity.UsersEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<FriendsEntity, Long> {

  Optional<FriendsEntity> findByRequesterAndReceiverAndFriendsStatus(
      UsersEntity usersEntity, UsersEntity friendsEntity, FriendsStatus friendsStatus
  );

  Optional<FriendsEntity> findByRequesterAndReceiverOrReceiverAndRequester(
      UsersEntity requesterId, UsersEntity receiverId,
      UsersEntity receiverIdAgain, UsersEntity requesterIdAgain);


}
