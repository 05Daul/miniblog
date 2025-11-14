package daul.userservice.service;

import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;

public interface UserService {
  void signUp(UsersDTO usersDTO);
  String login(LoginDTO loginDTO);

}
