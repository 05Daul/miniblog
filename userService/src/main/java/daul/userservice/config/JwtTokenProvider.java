package daul.userservice.config;

import daul.userservice.auth.service.CustomerDetailService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtParser;  // 추가: JwtParser 임포트 (필요 시)
import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtTokenProvider {

  private final SecretKey key;
  private final CustomerDetailService customerDetailService;
  private final String secret;

  public JwtTokenProvider(@Value("${jwt.secret}") String secret, CustomerDetailService customerDetailService) {
    this.secret = secret;
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
    this.customerDetailService = customerDetailService;
  }

  // 토큰에서 사용자 ID 추출
  public String getUserSignId(String token) {
    try {
      // 변경: parserBuilder() → parser()
      JwtParser parser = Jwts.parser()
          .verifyWith(key)  // 변경: setSigningKey → verifyWith (deprecated 피하기)
          .build();
      return parser.parseSignedClaims(token).getPayload().getSubject();
      // 또는 (deprecated지만 동작): .parseClaimsJws(token).getBody().getSubject();
    } catch (Exception e) {
      log.warn("토큰에서 사용자 ID 추출 실패: {}", e.getMessage());
      return null;
    }
  }

  // JWT 토큰 유효성 검사
  public boolean validateToken(String token) {
    try {
      // 변경: parserBuilder() → parser()
      JwtParser parser = Jwts.parser()
          .verifyWith(key)  // 변경: setSigningKey → verifyWith
          .build();
      parser.parseSignedClaims(token);  // 변경: parseClaimsJws → parseSignedClaims
      return true;
    } catch (ExpiredJwtException e) {
      log.warn("만료된 JWT 토큰입니다.");
    } catch (Exception e) {
      log.warn("유효하지 않은 JWT 토큰: {}", e.getMessage());
    }
    return false;
  }

  // 인증 정보 조회
  public Authentication getAuthentication(String token) {
    String userSignId = this.getUserSignId(token);
    if (userSignId == null) {
      return null;
    }
    // UserDetailsService를 통해 UserDetails 로드
    UserDetails userDetails = customerDetailService.loadUserByUsername(userSignId);

    // CustomUserDetails가 String 타입의 ID를 Principal로 사용하도록 구현되어 있다면,
    // userDetails.getUsername() 대신 userSignId를 사용할 수도 있습니다.
    // 현재 CustomerDetailService를 기반으로 UserDetails 사용 방식을 따릅니다.
    return new UsernamePasswordAuthenticationToken(userSignId, "", userDetails.getAuthorities());  }

  // HTTP 요청 헤더에서 토큰 추출
  public String resolveToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}