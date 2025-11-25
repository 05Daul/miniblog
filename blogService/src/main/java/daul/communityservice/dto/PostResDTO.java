package daul.communityservice.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResDTO {
  Long postId;
  String authorId;
  String title;
  String content;
  String thumbnail;
  Boolean isPublished;
  Integer viewCount;
  java.time.LocalDateTime createdAt;
  java.time.LocalDateTime updatedAt;
  List<String> tags;

}
