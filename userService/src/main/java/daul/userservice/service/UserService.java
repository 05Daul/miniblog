package daul.userservice.service;

import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import java.util.Map;

public interface UserService {
  void signUp(UsersDTO usersDTO);
  Map<String, String> login(LoginDTO loginDTO);

}
