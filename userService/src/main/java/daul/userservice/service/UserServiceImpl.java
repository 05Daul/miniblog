package daul.userservice.service;

import daul.userservice.auth.service.AuthService;
import daul.userservice.dao.UserDaoImpl;
import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import daul.userservice.entity.UsersEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserDaoImpl userDao;
  private final PasswordEncoder bCryptPasswordEncoder;
  private final AuthenticationManager authenticationManager;
  private final AuthService authService;

  @Override
  public void signUp(UsersDTO usersDTO) {
    log.info("user Service on signup");
    log.info(usersDTO.toString());

    DuplicateUserSignId(usersDTO);
    DuplicateEmail(usersDTO);

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
  public String login(LoginDTO loginDTO) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            loginDTO.getUserSignId(),
            loginDTO.getPassword()
        )
    );
    UsersEntity usersEntity = userDao.findByUserSignId(loginDTO.getUserSignId());

    if (usersEntity == null) {
      new RuntimeException("사용자가 존재하지 않습니다");
    }

    return authService.generateToken(usersEntity.getUserSignId(), usersEntity.getRoleName().toString());
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

}
