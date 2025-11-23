package daul.userservice.service;

import daul.userservice.auth.service.AuthService;
import daul.userservice.dao.FriendsDao;
import daul.userservice.dao.UserDao;
import daul.userservice.dto.FriendReqDto;
import daul.userservice.dto.FriendsResDto;
import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import daul.userservice.entity.FriendsEntity;
import daul.userservice.entity.FriendsStatus;
import daul.userservice.entity.UsersEntity;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserDao userDao;
  private final PasswordEncoder bCryptPasswordEncoder;
  private final AuthenticationManager authenticationManager;
  private final AuthService authService;
  private final FriendsDao friendDao;

  @Override
  public void signUp(UsersDTO usersDTO) {
    log.info("user Service on signup");
    log.info(usersDTO.toString());

    DuplicateUserSignId(usersDTO);
    DuplicateEmail(usersDTO);
    if (userDao.existsByUserSignId(usersDTO.getUserSignId())) {
      throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
    }
    if (userDao.existsByNickName(usersDTO.getNickName())) {
      throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
    }
    if (userDao.existsByEmail(usersDTO.getEmail())) {
      throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
    }


    UsersEntity usersEntity = new UsersEntity(
        usersDTO.getUserSignId(),
        usersDTO.getUserName(),
        usersDTO.getPassword(),
        usersDTO.getNickName(),
        usersDTO.getEmail(),
        usersDTO.getProfile_img()
    );
    usersEntity.hashPassword(bCryptPasswordEncoder);
    userDao.signUp(usersEntity);
  }

  @Override
  public Map<String, String> login(LoginDTO loginDTO) {

    // 1. 스프링 시큐리티 인증 처리
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            loginDTO.getUserSignId(),
            loginDTO.getPassword()
        )
    );

    // 2. DB에서 사용자 정보 조회
    UsersEntity usersEntity = userDao.findByUserSignId(loginDTO.getUserSignId());
    if (usersEntity == null) {
      throw new RuntimeException("사용자가 존재하지 않습니다.");
    }

    String role = usersEntity.getRoleName().toString();

    // 3. 토큰 생성
    String accessToken = authService.generateToken(usersEntity.getUserSignId(), role);
    String refreshToken = authService.generateRefreshToken(usersEntity.getUserSignId());

    // 4. Controller가 header에 넣을 수 있도록 AccessToken 포함 반환
    return Map.of(
        "userSignId", usersEntity.getUserSignId(),
        "role", role,
        "accessToken", accessToken,
        "refreshToken", refreshToken
    );
  }

  @Override
  @Transactional
  public FriendsResDto requestFriend(String requesterSignId, FriendReqDto reqdto) {

    // 1. 사용자 엔티티 조회 및 null 체크 (Optional을 반환하지 않으므로 직접 null 체크)
    UsersEntity req = userDao.findByUserSignId(requesterSignId);
    if (req == null) {
      throw new IllegalArgumentException("요청 사용자(Requester)를 찾을 수 없습니다.");
    }

    UsersEntity res = userDao.findByUserSignId(reqdto.getReceiverSignId());
    if (res == null) {
      throw new IllegalArgumentException("대상 사용자(Receiver)를 찾을 수 없습니다.");
    }

    // 2. 비즈니스 규칙 검증
    if (req.equals(res)) {
      throw new IllegalStateException("자기 자신에게 친구 요청을 보낼 수 없습니다.");
    }

    friendDao.findExistingFriendship(req, res)
        .ifPresent(existingFriendship -> {
          if (existingFriendship.getFriendsStatus() == FriendsStatus.ACCEPTED) {
            throw new IllegalStateException("이미 친구 관계입니다.");
          }
          if (existingFriendship.getFriendsStatus() == FriendsStatus.PENDING) {
            throw new IllegalStateException("이미 친구 요청이 대기 중입니다.");
          }
        });

    // 3. FriendsEntity 생성 (초기 상태: PENDING)
    FriendsEntity newRequest = new FriendsEntity(
        null,
        req,
        res,
        FriendsStatus.PENDING,
        null,
        null
    );

    // 4. 저장
    FriendsEntity savedEntity = friendDao.saveFriendRequest(newRequest);

    // 5. 결과 반환
    return new FriendsResDto(savedEntity);
  }


  @Override
  public FriendsResDto acceptFriend(String receiverSignId, String requesterSignId) {
    // 1. 사용자 엔티티 조회
    UsersEntity receiver = findUser(receiverSignId, "수락");
    UsersEntity requester = findUser(requesterSignId, "요청");

    // 2. 대기 중인 친구 요청을 조회 (요청자 -> 수신자 관계만 확인)
    FriendsEntity friendsEntity = friendDao.findPendingFriendship(requester, receiver)
        .orElseThrow(() -> new IllegalArgumentException("해당 요청자로부터 대기 중인 친구 요청을 찾을 수 없습니다."));

    // 3. 상태 확인 (PENDING 상태가 아니면 오류)
    if (friendsEntity.getFriendsStatus() != FriendsStatus.PENDING) {
      throw new IllegalStateException(
          "친구 요청이 PENDING 상태가 아닙니다. 현재 상태: " + friendsEntity.getFriendsStatus());
    }

    // 4. 상태를 ACCEPTED로 변경하고 저장 (***FriendsEntity에 setFriendsStatus 필요***)
    friendsEntity.setFriendsStatus(FriendsStatus.ACCEPTED);
    FriendsEntity acceptedEntity = friendDao.saveFriendRequest(friendsEntity);

    // 5. 결과 반환
    return new FriendsResDto(acceptedEntity);

  }

  private void DuplicateEmail(UsersDTO usersDTO) {
    if (userDao.findByEmail(usersDTO.getEmail()) != null) {
      throw new RuntimeException("이미 존재하는 이메일입니다.");
    }
  }

  private void DuplicateUserSignId(UsersDTO usersDTO) {
    if (userDao.findByUserSignId(usersDTO.getUserSignId()) != null) {
      throw new RuntimeException("이미 존재하는 아이디입니다.");
    }
  }

  private UsersEntity findUser(String signId, String role) {
    // UserDao의 findByUserSignId가 Optional이 아닌 UsersEntity를 직접 반환한다고 가정
    UsersEntity user = userDao.findByUserSignId(signId);

    if (user == null) {
      // 사용자를 찾지 못하면 즉시 예외 발생
      throw new IllegalArgumentException(role + " 사용자(" + signId + ")를 찾을 수 없습니다.");
    }
    return user;
  }
}
