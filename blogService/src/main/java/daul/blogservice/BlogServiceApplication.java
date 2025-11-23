package daul.blogservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BlogServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(BlogServiceApplication.class, args);
  }

  @Bean
  public FilterRegistrationBean<RequestLoggingFilter> loggingFilter() {
    FilterRegistrationBean<RequestLoggingFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new RequestLoggingFilter());
    registrationBean.addUrlPatterns("/*"); // 모든 URL 패턴에 필터 적용
    registrationBean.setOrder(1); // 가장 먼저 실행되도록 설정
    return registrationBean;
  }

}
