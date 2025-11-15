package daul.userservice.auth.service;

import daul.userservice.dao.UserDaoImpl;
import daul.userservice.entity.CustomUserDetails;
import daul.userservice.entity.UsersEntity;
import daul.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerDetailService implements UserDetailsService {

  private final UserDaoImpl userDao;


  /// AuthenticationManager 이 자동 호출.
  @Override
  public UserDetails loadUserByUsername(String userSignId) throws UsernameNotFoundException {
    try {
      UsersEntity user = userDao.findByUserSignId(userSignId);
      return new CustomUserDetails(user);

    }catch (Exception e){
      throw new UsernameNotFoundException("사용자를 찾을 수 없습니다.");
    }

  }
}
