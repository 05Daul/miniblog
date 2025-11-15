package daul.userservice.controller;

import daul.userservice.auth.service.AuthService;
import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import daul.userservice.entity.CustomUserDetails;
import daul.userservice.service.UserServiceImpl;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

  private final UserServiceImpl userService;

  @PostMapping("/signup")
  private ResponseEntity<String> signup(@Valid @RequestBody UsersDTO usersDTO) {
    try {
      log.info("use controller on signup");
      userService.signUp(usersDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 완료됐습니다.");
    } catch (Exception e) {
      log.error(e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 문제가 발생했습니다.");
    }
  }
  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginDTO loginDTO) {

    Map<String, String> result = userService.login(loginDTO);

    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + result.get("accessToken"));

    return ResponseEntity.ok()
        .headers(headers)
        .body(Map.of(
            "userSignId", result.get("userSignId"),
            "role", result.get("role"),
            "refreshToken", result.get("refreshToken")
        ));
  }

}
