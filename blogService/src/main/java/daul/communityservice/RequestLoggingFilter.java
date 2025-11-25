package daul.communityservice;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class RequestLoggingFilter implements Filter {

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest httpServletRequest = (HttpServletRequest) request;

    // 💡 이미지 요청 경로만 필터링하여 출력
    String requestUri = httpServletRequest.getRequestURI();
    if (requestUri.contains("/images/")) {
      log.warn("🚨 [IMAGE REQUEST LOG] Full URI: {}", requestUri);
    }

    chain.doFilter(request, response);
  }

}
