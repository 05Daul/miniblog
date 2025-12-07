package daul.userservice.service;

import daul.userservice.auth.service.AuthService;
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

  @Override
  public boolean existsByEmail(String email) {
    return userDao.existsByEmail(email);
  }

  @Override
  public boolean existsByUserSignId(String userSignId) {
    return userDao.existsByUserSignId(userSignId);
  }

  @Override
  public boolean existsByNickName(String email) {
    return userDao.existsByNickName(email);
  }

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
