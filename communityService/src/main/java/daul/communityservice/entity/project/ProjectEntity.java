package daul.communityservice.entity.project;

import daul.communityservice.entity.BaseCommunityEntity;
import daul.communityservice.entity.PostFormat;
import daul.communityservice.entity.RecruitmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "project_entity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProjectEntity extends BaseCommunityEntity {

  @Column(nullable = false)
  private LocalDateTime deadline; //마감일

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RecruitmentStatus status; // 모집 상태 (모집중, 모집 마감)

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PostFormat format; // 진행 방식 (온라인, 오프라인)

  @Column(name = "team_size", nullable = true)
  private Integer teamSize; // 모집 인원

}
