package daul.userservice.repository;

import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.FriendsStatus;
import daul.userservice.entity.UsersEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRepository extends JpaRepository<FriendsEntity, Long> {

  // 특정 요청자와 수신자 간의 특정 상태의 친구 관계 조회
  Optional<FriendsEntity> findByRequesterAndReceiverAndFriendsStatus(
      UsersEntity requester,
      UsersEntity receiver,
      FriendsStatus friendsStatus
  );

  // 특정 유저가 받은 친구 요청 목록 (상태별)
  List<FriendsEntity> findByReceiverAndFriendsStatus(
      UsersEntity receiver,
      FriendsStatus status
  );

  // 특정 유저가 보낸 친구 요청 목록 (상태별)
  List<FriendsEntity> findByRequesterAndFriendsStatus(
      UsersEntity requester,
      FriendsStatus status
  );

  // 특정 유저의 모든 친구 목록 조회 (양방향)
  @Query("SELECT f FROM FriendsEntity f WHERE " +
      "(f.requester.userSignId = :userSignId OR f.receiver.userSignId = :userSignId) " +
      "AND f.friendsStatus = :status")
  List<FriendsEntity> findAllFriendsByUserSignIdAndStatus(
      @Param("userSignId") String userSignId,
      @Param("status") FriendsStatus status
  );

  // 두 유저 간 친구 관계 존재 여부 확인 (양방향, 모든 상태)
  @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM FriendsEntity f WHERE " +
      "((f.requester = :user1 AND f.receiver = :user2) OR " +
      "(f.requester = :user2 AND f.receiver = :user1))")
  boolean existsFriendshipBetween(
      @Param("user1") UsersEntity user1,
      @Param("user2") UsersEntity user2
  );

  // 두 유저 간 특정 상태의 친구 관계 조회 (양방향)
  @Query("SELECT f FROM FriendsEntity f WHERE " +
      "((f.requester = :user1 AND f.receiver = :user2) OR " +
      "(f.requester = :user2 AND f.receiver = :user1)) " +
      "AND f.friendsStatus = :status")
  Optional<FriendsEntity> findFriendshipBetweenWithStatus(
      @Param("user1") UsersEntity user1,
      @Param("user2") UsersEntity user2,
      @Param("status") FriendsStatus status
  );
}