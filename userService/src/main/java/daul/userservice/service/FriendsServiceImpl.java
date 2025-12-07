package daul.userservice.service;

import daul.userservice.dto.FriendsResDto;
import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.FriendsStatus;
import daul.userservice.entity.UsersEntity;
import daul.userservice.repository.FriendRepository;
import daul.userservice.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendsServiceImpl implements FriendsService {

  private final FriendRepository friendsRepository;
  private final UserRepository usersRepository;

  /**
   * 친구 요청 보내기
   */
  @Transactional
  @Override
  public FriendsResDto sendFriendRequest(String requesterSignId, String receiverSignId) {
    // 1. 유저 조회
    UsersEntity requester = usersRepository.findByUserSignId(requesterSignId);
    UsersEntity receiver = usersRepository.findByUserSignId(receiverSignId);
    // 2. 자기 자신에게 요청 방지
    if (requesterSignId.equals(receiverSignId)) {
      return null; // 자기 자신에게 요청 불가 → 프론트에서 메시지 처리
    }

    // 3. 이미 친구 관계가 있는지 확인 (양방향, 모든 상태)
    if (friendsRepository.existsFriendshipBetween(requester, receiver)) {
      return null; // 이미 친구 관계 존재 → 프론트에서 메시지 처리
    }

    // 4. 친구 요청 생성
    FriendsEntity friendRequest = new FriendsEntity();
    friendRequest.setRequester(requester);
    friendRequest.setReceiver(receiver);
    friendRequest.setFriendsStatus(FriendsStatus.PENDING);

    FriendsEntity saved = friendsRepository.save(friendRequest);

    return new FriendsResDto(saved);
  }

  /**
   * 친구 요청 수락
   */
  @Transactional
  @Override

  public FriendsResDto acceptFriendRequest(Long friendId, String receiverSignId) {
    // 1. 친구 요청 조회
    FriendsEntity friendRequest = friendsRepository.findById(friendId)
        .orElseThrow(() -> new IllegalArgumentException("친구 요청을 찾을 수 없습니다"));

    // 2. 수신자 본인만 수락 가능
    if (!friendRequest.getReceiver().getUserSignId().equals(receiverSignId)) {
      throw new IllegalArgumentException("친구 요청을 수락할 권한이 없습니다");
    }

    // 3. PENDING 상태인지 확인
    if (friendRequest.getFriendsStatus() != FriendsStatus.PENDING) {
      throw new IllegalArgumentException("대기 중인 요청만 수락할 수 있습니다");
    }

    // 4. 상태를 ACCEPTED로 변경
    friendRequest.setFriendsStatus(FriendsStatus.ACCEPTED);
    FriendsEntity accepted = friendsRepository.save(friendRequest);

    return new FriendsResDto(accepted);
  }

  /**
   * 친구 요청 거절
   */
  @Transactional
  @Override
  public void rejectFriendRequest(Long friendId, String receiverSignId) {
    // 1. 친구 요청 조회
    FriendsEntity friendRequest = friendsRepository.findById(friendId)
        .orElseThrow(() -> new IllegalArgumentException("친구 요청을 찾을 수 없습니다"));

    // 2. 수신자 본인만 거절 가능
    if (!friendRequest.getReceiver().getUserSignId().equals(receiverSignId)) {
      throw new IllegalArgumentException("친구 요청을 거절할 권한이 없습니다");
    }

    // 3. PENDING 상태인지 확인
    if (friendRequest.getFriendsStatus() != FriendsStatus.PENDING) {
      throw new IllegalArgumentException("대기 중인 요청만 거절할 수 있습니다");
    }

    // 4. 요청 삭제
    friendsRepository.delete(friendRequest);
  }

  /**
   * 친구 삭제 (친구 관계 끊기)
   */
  @Transactional
  @Override

  public void deleteFriend(Long friendId, String userSignId) {
    // 1. 친구 관계 조회
    FriendsEntity friendship = friendsRepository.findById(friendId)
        .orElseThrow(() -> new IllegalArgumentException("친구 관계를 찾을 수 없습니다"));

    // 2. 요청자 또는 수신자만 삭제 가능
    if (!friendship.getRequester().getUserSignId().equals(userSignId) &&
        !friendship.getReceiver().getUserSignId().equals(userSignId)) {
      throw new IllegalArgumentException("삭제 권한이 없습니다");
    }

    // 3. 친구 관계 삭제
    friendsRepository.delete(friendship);
  }

  /**
   * 친구 차단
   */
  @Transactional
  @Override

  public FriendsResDto blockUser(String blockerSignId, String blockedSignId) {
    // 1. 유저 조회
    UsersEntity blocker = usersRepository.findByUserSignId(blockerSignId);
    UsersEntity blocked = usersRepository.findByUserSignId(blockedSignId);

    // 2. 자기 자신 차단 방지
    if (blockerSignId.equals(blockedSignId)) {
      throw new IllegalArgumentException("자기 자신을 차단할 수 없습니다");
    }

    // 3. 기존 관계 확인 (양방향)
    Optional<FriendsEntity> existingRelation = friendsRepository
        .findFriendshipBetweenWithStatus(blocker, blocked, FriendsStatus.PENDING);

    if (existingRelation.isEmpty()) {
      existingRelation = friendsRepository
          .findFriendshipBetweenWithStatus(blocker, blocked, FriendsStatus.ACCEPTED);
    }

    FriendsEntity blockRelation;
    if (existingRelation.isPresent()) {
      // 기존 관계를 BLOCKED로 변경
      blockRelation = existingRelation.get();
      blockRelation.setFriendsStatus(FriendsStatus.BLOCKED);
    } else {
      // 새로운 차단 관계 생성
      blockRelation = new FriendsEntity();
      blockRelation.setRequester(blocker);
      blockRelation.setReceiver(blocked);
      blockRelation.setFriendsStatus(FriendsStatus.BLOCKED);
    }

    FriendsEntity saved = friendsRepository.save(blockRelation);
    return new FriendsResDto(saved);
  }

  /**
   * 차단 해제
   */
  @Transactional
  @Override

  public void unblockUser(Long friendId, String blockerSignId) {
    // 1. 차단 관계 조회
    FriendsEntity blockRelation = friendsRepository.findById(friendId)
        .orElseThrow(() -> new IllegalArgumentException("차단 관계를 찾을 수 없습니다"));

    // 2. 차단한 본인만 해제 가능
    if (!blockRelation.getRequester().getUserSignId().equals(blockerSignId)) {
      throw new IllegalArgumentException("차단 해제 권한이 없습니다");
    }

    // 3. BLOCKED 상태인지 확인
    if (blockRelation.getFriendsStatus() != FriendsStatus.BLOCKED) {
      throw new IllegalArgumentException("차단 상태가 아닙니다");
    }

    // 4. 차단 관계 삭제
    friendsRepository.delete(blockRelation);
  }

  /**
   * 받은 친구 요청 목록 조회
   */
  @Override
  @Transactional(readOnly = true)
  public List<FriendsResDto> getReceivedRequests(String userSignId) {
    UsersEntity user = usersRepository.findByUserSignId(userSignId);
    return friendsRepository.findByReceiverAndFriendsStatus(user, FriendsStatus.PENDING)
        .stream()
        .map(FriendsResDto::new)
        .collect(Collectors.toList());
  }

  /**
   * 보낸 친구 요청 목록 조회
   */
  @Override
  @Transactional(readOnly = true)
  public List<FriendsResDto> getSentRequests(String userSignId) {
    UsersEntity user = usersRepository.findByUserSignId(userSignId);
    return friendsRepository.findByRequesterAndFriendsStatus(user, FriendsStatus.PENDING)
        .stream()
        .map(FriendsResDto::new)
        .collect(Collectors.toList());
  }

  /**
   * 친구 목록 조회 (ACCEPTED 상태만)
   */
  @Override
  @Transactional(readOnly = true)
  public List<FriendsResDto> getFriendsList(String userSignId) {
    List<FriendsEntity> friendships = friendsRepository
        .findAllFriendsByUserSignIdAndStatus(userSignId, FriendsStatus.ACCEPTED);

    return friendships.stream()
        .map(FriendsResDto::new)
        .collect(Collectors.toList());
  }

  /**
   * 차단 목록 조회
   */
  @Override
  @Transactional(readOnly = true)
  public List<FriendsResDto> getBlockedList(String userSignId) {
    UsersEntity user = usersRepository.findByUserSignId(userSignId);

    return friendsRepository.findByRequesterAndFriendsStatus(user, FriendsStatus.BLOCKED)
        .stream()
        .map(FriendsResDto::new)
        .collect(Collectors.toList());
  }

  /**
   * 두 유저 간의 친구 관계 상태 조회
   */
  @Override
  @Transactional(readOnly = true)
  public FriendsResDto getFriendshipStatus(String userSignId, String targetUserSignId) {
    UsersEntity user = usersRepository.findByUserSignId(userSignId);
    UsersEntity targetUser = usersRepository.findByUserSignId(targetUserSignId);

    // ACCEPTED 상태 확인
    Optional<FriendsEntity> friendship = friendsRepository
        .findFriendshipBetweenWithStatus(user, targetUser, FriendsStatus.ACCEPTED);

    if (friendship.isPresent()) {
      return new FriendsResDto(friendship.get());
    }

    // PENDING 상태 확인
    friendship = friendsRepository
        .findFriendshipBetweenWithStatus(user, targetUser, FriendsStatus.PENDING);

    if (friendship.isPresent()) {
      return new FriendsResDto(friendship.get());
    }

    // BLOCKED 상태 확인
    friendship = friendsRepository
        .findFriendshipBetweenWithStatus(user, targetUser, FriendsStatus.BLOCKED);

    if (friendship.isPresent()) {
      return new FriendsResDto(friendship.get());
    }
    // 관계 없음
    return null;
  }

  @Override
  @Transactional(readOnly = true)
  public List<String> getMSAFriendSignIds(String userSignId) {
    // FriendsStatus.ACCEPTED 상태의 친구 관계 엔티티를 모두 가져옵니다.
    List<FriendsEntity> friends = friendsRepository.findAllFriendsByUserSignIdAndStatus(
        userSignId,
        FriendsStatus.ACCEPTED
    );

    // 결과에서 친구의 userSignId만 추출합니다.
    return friends.stream()
        .map(entity -> {
          // 친구 관계는 요청자/수신자 중 "나"가 아닌 다른 사람이 친구입니다.
          if (entity.getRequester().getUserSignId().equals(userSignId)) {
            return entity.getReceiver().getUserSignId();
          }
          return entity.getRequester().getUserSignId();
        })
        .collect(Collectors.toList());
  }
}