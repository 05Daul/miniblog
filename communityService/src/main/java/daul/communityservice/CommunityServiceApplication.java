package daul.communityservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CommunityServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(CommunityServiceApplication.class, args);
  }
}
