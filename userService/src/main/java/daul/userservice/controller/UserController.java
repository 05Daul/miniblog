package daul.userservice.controller;

import daul.userservice.auth.service.AuthService;
import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import daul.userservice.entity.CustomUserDetails;
import daul.userservice.service.UserServiceImpl;
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
  private final AuthService authService;
  private final AuthenticationManager authenticationManager;

  @PostMapping("/signup")
  private ResponseEntity<String> signup(@RequestBody UsersDTO usersDTO) {
    try {
      userService.signUp(usersDTO);
      log.info("use controller on signup");
      log.info(usersDTO.toString());
      return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 완료됐습니다.");
    } catch (Exception e) {
      log.error(e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 문제가 발생했습니다.");
    }
  }
  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@RequestBody LoginDTO loginDTO) {

    String userSignId = loginDTO.getUserSignId();

    if (userSignId == null || loginDTO.getPassword() == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "아이디와 비밀번호를 입력해주세요."));
    }

    try {
      /// 1. 인증 객체 생성 및 인증 시도
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(userSignId, loginDTO.getPassword())
      );
      // 2. 인증 성공 후 사용자 정보 추출
      CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

      String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
      log.info(role);

      // 3. JWT Access/Refresh 토큰 생성
      String accessToken = authService.generateToken(userSignId, role);
      String refreshToken = authService.generateRefreshToken(userSignId);

      // 4. 응답 구성 -> Access Token은 Header, Refresh Token은 Body
      HttpHeaders headers = new HttpHeaders();
      // 클라이언트가 요청 시 사용할 Access Token을 Authorization 헤더에 저장
      headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);

      Map<String, String> responseBody = Map.of(
          "userSignId", userSignId,
          "role", role,
          "refreshToken", refreshToken
      );

      log.info("로그인 성공: userSignId={}", userSignId);
      return ResponseEntity.ok().headers(headers).body(responseBody);

    } catch (Exception e) {
      log.error("로그인 처리 중 서버 오류: userSignId={} - {}", userSignId, e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "로그인 처리 중 문제가 발생했습니다."));
    }
  }

}
