package daul.userservice.dao;

import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.FriendsStatus;
import daul.userservice.entity.UsersEntity;
import daul.userservice.repository.FriendRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FriendsDaoImpl implements FriendsDao {

  private final FriendRepository friendRepository;

  @Override
  public Optional<FriendsEntity> findExistingFriendship(UsersEntity user1, UsersEntity user2) {
    return friendRepository.findByRequesterAndReceiverOrReceiverAndRequester(user1, user2, user2, user1);
  }

  @Override
  public FriendsEntity saveFriendRequest(FriendsEntity friendsEntity) {
    return friendRepository.save(friendsEntity);
  }

  @Override
  public Optional<FriendsEntity> findPendingFriendship(UsersEntity requester,
      UsersEntity receiver) {
    return friendRepository.findByRequesterAndReceiverAndFriendsStatus(
        requester, receiver, FriendsStatus.PENDING
    );
  }


}
