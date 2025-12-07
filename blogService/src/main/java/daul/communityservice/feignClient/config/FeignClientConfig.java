package daul.communityservice.feignClient.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

  @Bean
  public RequestInterceptor requestInterceptor() {
    return requestTemplate -> { // 람다식 사용으로 더 간결하게

      ServletRequestAttributes attributes =
          (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

      if (attributes != null) {
        HttpServletRequest request = attributes.getRequest();

        // 1. Authorization 헤더 복사 (JWT)
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null) {
          // Bearer 접두사를 포함한 전체 헤더 값을 그대로 복사
          requestTemplate.header("Authorization", authorizationHeader);
        }

        // 2. userSignId 헤더 복사 (추가 헤더)
        String userSignIdHeader = request.getHeader("userSignId");
        if (userSignIdHeader != null) {
          requestTemplate.header("userSignId", userSignIdHeader);
        }
      }
      // else: Feign 요청이 HTTP 요청 컨텍스트 외부(예: 스케줄러)에서 호출된 경우,
      // 토큰을 전달하지 않고 진행합니다. (현재는 HTTP 요청 내에서만 호출되므로 정상 작동 기대)
    };
  }
}