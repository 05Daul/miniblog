package daul.userservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider jwtTokenProvider;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    // 1. HTTP 헤더에서 JWT 토큰을 추출
    String token = jwtTokenProvider.resolveToken(request);

    // 2. 토큰이 존재하고 유효한 경우
    if (token != null && jwtTokenProvider.validateToken(token)) {
      try {
        // 3. 토큰으로부터 인증 정보(Authentication)를 생성
        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        if (authentication != null) {
          // 4. Security Context에 인증 정보 저장.
          // 이 정보로부터 @AuthenticationPrincipal에 값이 주입됨.
          SecurityContextHolder.getContext().setAuthentication(authentication);
          log.info("JWT 인증 성공: 사용자 ID: {}", authentication.getName());
        }
      } catch (Exception e) {
        // 토큰은 유효했지만 인증 객체 생성 중 오류 발생 시 (예: User Not Found)
        log.error("JWT 인증 처리 중 오류 발생: {}", e.getMessage());
        // SecurityContext를 비워 다음 필터로 진행
        SecurityContextHolder.clearContext();
      }
    }

    // 다음 필터로 진행
    filterChain.doFilter(request, response);
  }
}