package daul.common.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Jwts.SIG;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class JwtUtil {

  /// 토큰 검증을 담당

  @Value("${jwt.secret}") private String secret;
  @Value("${jwt.expired}") private Long expired;
  @Value("${jwt.refresh}") private Long refresh;

  private SecretKey getKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }


  public String extractUserSignId(String token) {
    return Jwts.parser().verifyWith(getKey()).build()
        .parseSignedClaims(token)
        .getPayload()
        .getSubject();
  }

  public String extractRole(String token) {
    return Jwts.parser().verifyWith(getKey()).build()
      .parseSignedClaims(token)
        .getPayload().get("role", String.class);
  }

  public boolean validateToken(String token, String userSignId) {
    try {
      String subject = extractUserSignId(token);
      return subject.equals(userSignId) && !isExpired(token);
    } catch (Exception e) { return false; }
  }

  private boolean isExpired(String token) {
    return Jwts.parser().verifyWith(getKey()).build()
        .parseSignedClaims(token)
        .getPayload().getExpiration().before(new Date());
  }

}
