package daul.userservice.dao;

import daul.userservice.entity.UsersEntity;
import daul.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;


@Repository
@RequiredArgsConstructor
@Slf4j
public class UserDaoImpl implements UserDao {

  private final UserRepository userRepository;

  @Override
  public UsersEntity signUp(UsersEntity usersEntity) {
    log.info("UserDaoImpl signUp");
    log.info("usersEntity: {}", usersEntity);
    return userRepository.save(usersEntity);
  }

  @Override
  public UsersEntity findByUserSignId(String userSignId) {
    return userRepository.findByUserSignId(userSignId);
  }

  @Override
  public UsersEntity findByEmail(String email) {
    return null;
  }
}
