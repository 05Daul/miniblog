package daul.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  /// 시큐리티 사용을 위한 Config 패키지

  @Bean  /// 단방향 암호화
  public PasswordEncoder bCryptPasswordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // 1. http요청에 권한부여 시작
        .authorizeHttpRequests(authorize -> authorize
            //2. 권한을 설정할 특정 URL을 .requestMatchers()로 설정 현재는 전부 허용
            // requestMatchers 중복 사용 가능. .requestMatchers("/user/**").hasRole("USER") 이런식
            .requestMatchers("/user/signup").permitAll()
            //3 .authenticated()로 인증 정보 설정
            .anyRequest().authenticated()
        );
    return http.build();
  }

}
