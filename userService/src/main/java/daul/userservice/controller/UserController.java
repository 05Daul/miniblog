package daul.userservice.controller;

import static org.springframework.http.ResponseEntity.ok;

import daul.userservice.dto.FriendReqDto;
import daul.userservice.dto.FriendsResDto;
import daul.userservice.dto.LoginDTO;
import daul.userservice.dto.UsersDTO;
import daul.userservice.service.UserServiceImpl;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@RestControllerAdvice
public class UserController {

  private final UserServiceImpl userService;

  @GetMapping("/existId")
  public ResponseEntity<String> existUserId(@RequestParam("userId") String userId) {
    boolean exists = userService.existsByUserSignId(userId);
    return ResponseEntity.ok(exists ? "exists" : "not exists");
  }

  @GetMapping("/existEmail")
  public ResponseEntity<String> existEmail(@RequestParam("email") String email) {
    boolean exists = userService.existsByEmail(email);
    return ResponseEntity.ok(exists ? "exists" : "not exists");
  }

  @GetMapping("/existNickname")
  public ResponseEntity<String> existNickname(@RequestParam("nickname") String nickname) {
    boolean exists = userService.existsByNickName(nickname);
    return ResponseEntity.ok(exists ? "exists" : "not exists");
  }

  @PostMapping("/signup")
  public ResponseEntity<String> signup(@Valid @RequestBody UsersDTO usersDTO) {
    try {
      log.info("use controller on signup");
      userService.signUp(usersDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 완료됐습니다.");
    } catch (RuntimeException e) { // <- RuntimeException only
      log.error(e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    } catch (Exception e) {
      log.error(e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("회원가입 중 문제가 발생했습니다.");
    }
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginDTO loginDTO) {

    Map<String, String> result = userService.login(loginDTO);

    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + result.get("accessToken"));

    return ok()
        .headers(headers)
        .body(Map.of(
            "userSignId", result.get("userSignId"),
            "role", result.get("role"),
            "refreshToken", result.get("refreshToken")
        ));
  }

  private ResponseEntity<FriendsResDto> handleFriendshipException(Exception e) {
    if (e instanceof IllegalArgumentException) {
      // 사용자 ID를 찾을 수 없거나, 대기 요청을 찾을 수 없을 때 404
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    } else if (e instanceof IllegalStateException) {
      String message = e.getMessage();
      if (message.contains("자기 자신")) {
        // 자기 자신에게 요청한 경우 400 Bad Request
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
      } else if (message.contains("이미 친구") || message.contains("이미 요청") || message.contains(
          "PENDING 상태가 아닙니다")) {
        // 이미 친구 관계이거나, 상태가 유효하지 않은 경우 409 Conflict
        return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
      }
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
  }
}
