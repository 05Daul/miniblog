package daul.userservice.repository;

import daul.userservice.entity.UsersEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UsersEntity, Long> {
    UsersEntity save(UsersEntity userEntity);

    UsersEntity findByUserSignId(String userSignId);
    UsersEntity findByEmail(String Email);

    boolean existsByUserSignId(String userSignId);
    boolean existsByNickName(String nickName);


  boolean existsByEmail(String email);
}
