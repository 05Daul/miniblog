package daul.userservice.dao;

import daul.userservice.entity.UsersEntity;

public interface UserDao {
  UsersEntity signUp(UsersEntity usersEntity);
  UsersEntity findByUserSignId(String userSignId);
  UsersEntity findByEmail(String email);
  boolean existsByUserSignId(String userSignId);
  boolean existsByNickName(String email);
  boolean existsByEmail(String email);

}
