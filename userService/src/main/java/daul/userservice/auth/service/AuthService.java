package daul.userservice.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Jwts.SIG;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/***
 * 토큰 생성은 유저의 login 메서드 에서 담당
 */

@Service
public class AuthService {
  @Value("${jwt.secret}") private String secret;
  @Value("${jwt.expired}") private Long expired;
  @Value("${jwt.refresh}") private Long refresh;

  private SecretKey getKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generateToken(String userSignId,String role) {
    Map<String, Object> claims = Map.of("role", role);
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(userSignId)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis()+expired))
        .signWith(getKey(), SIG.HS256)
        .compact();
  }

  public String generateRefreshToken(String userSignId) {
    return Jwts.builder()
        .setSubject(userSignId)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + refresh))
        .signWith(getKey(), SIG.HS256)
        .compact();
  }


}
