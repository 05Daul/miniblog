package daul.userservice.service;

import daul.userservice.dao.UserDaoImpl;
import daul.userservice.dto.UsersDTO;
import daul.userservice.entity.UsersEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserDaoImpl userDao;
  private final PasswordEncoder bCryptPasswordEncoder;

  @Override
  public void signUp(UsersDTO usersDTO) {
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

  // 암호화된 비밀번호 확인용, 추후 확인
  public boolean checkPassword(String plainPassword, PasswordEncoder passwordEncoder,UsersDTO usersDTO) {
    return passwordEncoder.matches(plainPassword, usersDTO.getPassword());
  }
}
