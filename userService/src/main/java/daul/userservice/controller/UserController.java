package daul.userservice.controller;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
@RestControllerAdvice
public class UserController {

  private final UserServiceImpl userService;

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

    return ResponseEntity.ok()
        .headers(headers)
        .body(Map.of(
            "userSignId", result.get("userSignId"),
            "role", result.get("role"),
            "refreshToken", result.get("refreshToken")
        ));
  }

  @PostMapping("/friends")
  public ResponseEntity<FriendsResDto> requestFriend(
      @RequestHeader("userSignId") String requesterSignId, // 요청자
      @RequestBody FriendReqDto reqdto) {                   // 수신자

    try {
      FriendsResDto responseDto = userService.requestFriend(requesterSignId, reqdto);
      // 성공적인 친구 요청 생성 시 HTTP 201 Created 반환
      return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

    } catch (IllegalArgumentException e) {
      // 사용자(요청자 또는 수신자) ID를 찾을 수 없는 경우 -> 404 Not Found 반환
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

    } catch (IllegalStateException e) {
      String message = e.getMessage();

      if (message.contains("본인에게 친구 신청을 할 수 없습니다.")) {
        // 부적절한 요청 데이터 (Bad Request)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
      } else if (message.contains("이미 친구 관계입니다.") || message.contains("친구 요청이 전송됐습니다.")) {
        // 중복으로 인한 상태 충돌 (Conflict)
        return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
      }
      // 그 외 처리되지 않은 IllegalStateException은 서버 오류로 처리
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }

  @PutMapping("/friends/{requesterSignId}/accept")
  public ResponseEntity<FriendsResDto> acceptFriend(
      @RequestHeader("userSignId") String receiverSignId, // 수락하는 사용자 ID (로그인 사용자)
      @PathVariable String requesterSignId) {               // 요청을 보낸 사용자 ID

    try {
      FriendsResDto responseDto = userService.acceptFriend(receiverSignId, requesterSignId);
      // 상태 변경 성공 시 HTTP 200 OK 반환
      return ResponseEntity.ok(responseDto);
    } catch (Exception e) {
      return handleFriendshipException(e);
    }
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
      } else if (message.contains("이미 친구") || message.contains("이미 요청") || message.contains("PENDING 상태가 아닙니다")) {
        // 이미 친구 관계이거나, 상태가 유효하지 않은 경우 409 Conflict
        return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
      }
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
  }
}
