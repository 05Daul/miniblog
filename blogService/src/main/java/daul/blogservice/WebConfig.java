package daul.blogservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  // application.yml에 정의된 파일 업로드 경로를 주입받습니다.
  @Value("${file.upload-dir}")
  private String uploadDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/images/**") // 💡 URL 요청 경로: /images/ 로 들어오는 모든 요청
        .addResourceLocations("file:" + uploadDir+"/");
  }
}