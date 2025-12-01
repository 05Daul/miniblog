package daul.communityservice.dto;

import static daul.communityservice.entity.tag.CommunityPostType.CONCERN;
import static daul.communityservice.entity.tag.CommunityPostType.PROJECT;
import static daul.communityservice.entity.tag.CommunityPostType.STUDY;

import daul.communityservice.entity.BaseCommunityEntity;
import daul.communityservice.entity.concern.ConcernEntity;
import daul.communityservice.entity.project.ProjectEntity;
import daul.communityservice.entity.study.StudyEntity;
import daul.communityservice.entity.tag.CommunityPostType;
import java.util.Map;
import java.util.Objects;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDetailResponse {

  private Long communityId;
  private CommunityPostType type;
  private String title;
  private String content;
  private String authorId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private int viewCount;
  private int likeCount;
  private int commentCount;
  private boolean isLiked;     // 현재 로그인 유저가 좋아요 눌렀는지
  private boolean isAuthor;    // 현재 로그인 유저가 작성자인지
  private List<String> tags;

  // Project, Study, Concern 각각의 특수 정보
  private Object detailInfo;   // ProjectDetailInfo | StudyDetailInfo | ConcernDetailInfo

  public static PostDetailResponse of(
      BaseCommunityEntity entity,
      CommunityPostType type,
      List<String> tags,
      long likeCount,
      long commentCount,
      boolean isLiked,
      String currentUserId) {

    // 타입별 추가 정보
    Object detailInfo = switch (type) {
      case PROJECT -> {
        ProjectEntity p = (ProjectEntity) entity;
        Integer teamSize = p.getTeamSize() != null ? p.getTeamSize() : 0;
        yield Map.of(
            "deadline", p.getDeadline(),
            "format",   p.getFormat(),
            "status",   p.getStatus(),
            "teamSize", teamSize
        );
      }
      case STUDY -> {
        StudyEntity s = (StudyEntity) entity;
        String schedule = Objects.toString(s.getSchedule(), "");
        yield Map.of(
            "startDate", s.getStartDate(),
            "schedule",  schedule,
            "format",    s.getFormat(),
            "status",    s.getStatus()
        );
      }
      case CONCERN -> {
        ConcernEntity c = (ConcernEntity) entity;
        yield Map.of("isResolved", c.getIsResolved());
      }
    };

    boolean isAuthor = currentUserId != null && currentUserId.equals(entity.getAuthorId());

    return PostDetailResponse.builder()
        .communityId(entity.getCommunityId())
        .type(type)
        .title(entity.getTitle())
        .content(entity.getContent())
        .authorId(entity.getAuthorId())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .viewCount(entity.getViewCount())
        .likeCount((int) likeCount)
        .commentCount((int) commentCount)
        .isLiked(isLiked)
        .isAuthor(isAuthor)
        .tags(tags)
        .detailInfo(detailInfo)
        .build();
  }
}
