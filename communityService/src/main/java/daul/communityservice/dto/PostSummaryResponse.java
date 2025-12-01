package daul.communityservice.dto;
import daul.communityservice.entity.RecruitmentStatus;
import daul.communityservice.entity.tag.CommunityPostType;
import java.time.LocalDate;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostSummaryResponse {
  private Long communityId;
  private CommunityPostType type;
  private String content;
  private String title;
  private String authorId;
  private LocalDateTime createdAt;
  private int viewCount;
  private int likeCount;
  private int commentCount;
  private List<String> tags;
  private RecruitmentStatus status;
  private LocalDateTime deadline;
  private LocalDate startDate;
}
