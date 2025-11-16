package daul.gateway.config;

import daul.common.jwt.JwtUtil;
import daul.gateway.config.JwtAuthenticationFilter.Config;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<Config> {

  private final JwtUtil jwtUtil;

  public JwtAuthenticationFilter(JwtUtil jwtUtil) {
    super(Config.class);
    this.jwtUtil = jwtUtil;
  }

  @Override
  public GatewayFilter apply(Config config) {
    return (exchange, chain) -> {
      ServerHttpRequest request = exchange.getRequest();
      String path = request.getPath().toString();
      log.info("Request Path: {}", path);
      // 공개 경로 허용
      if (isPublicPath(path)) {
        log.info("Public Path Matched. Bypassing JWT Check: {}", path);
        return chain.filter(exchange);
      }

      String token = extractToken(request);
      if (token == null) {
        log.info("Token Check Required: {}", path);
        return onError(exchange, "Missing token", HttpStatus.UNAUTHORIZED);
      }

      try {
        String userSignId = jwtUtil.extractUserSignId(token);
        if (!jwtUtil.validateToken(token, userSignId)) {
          return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
        }

        String role = jwtUtil.extractRole(token);

        ServerHttpRequest modified = request.mutate()
            .header("userSignId", userSignId)
            .header("role", role)
            .build();

        return chain.filter(exchange.mutate().request(modified).build());

      } catch (Exception e) {
        log.error("JWT 검증 실패: {}", e.getMessage());
        return onError(exchange, "Token error", HttpStatus.UNAUTHORIZED);
      }
    };
  }

  private boolean isPublicPath(String path) {
    return path.matches(".*/(signup|login|oauth2|refresh).*");
  }

  private String extractToken(ServerHttpRequest request) {
    String auth = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    return (auth != null && auth.startsWith("Bearer ")) ? auth.substring(7) : null;
  }

  private Mono<Void> onError(ServerWebExchange exchange, String msg, HttpStatus status) {
    ServerHttpResponse response = exchange.getResponse();
    response.setStatusCode(status);
    return response.setComplete();
  }

  public static class Config {
  }
}