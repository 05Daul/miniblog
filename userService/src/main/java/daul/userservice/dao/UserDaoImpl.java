package daul.userservice.dao;

import daul.userservice.entity.UsersEntity;
import daul.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserDaoImpl implements UserDao {

  private final UserRepository userRepository;

  @Override
  public UsersEntity signUp(UsersEntity usersEntity) {
    return userRepository.save(usersEntity);
  }
}
