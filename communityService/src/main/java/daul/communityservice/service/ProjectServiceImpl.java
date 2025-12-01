package daul.communityservice.service;

import daul.communityservice.dto.CreateProjectRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import daul.communityservice.entity.RecruitmentStatus;
import daul.communityservice.entity.project.ProjectEntity;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.repository.ProjectRepository;
import java.util.List;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
@Builder
public class ProjectServiceImpl implements ProjectService {
  private final ProjectRepository projectRepository;
  private final TagService tagService;
  private final LikeService likeService;
  private final CommentService commentService;

  @Override
  public Long createProject(CreateProjectRequest request, String authorId) {
    ProjectEntity project = ProjectEntity.builder()
        .authorId(authorId)
        .title(request.getTitle())
        .content(request.getContent())
        .deadline(request.getDeadline())
        .format(request.getFormat())
        .teamSize(request.getTeamSize())
        .status(RecruitmentStatus.RECRUITING)
        .viewCount(0)
        .build();

    ProjectEntity saved = projectRepository.save(project);
    tagService.updateTags(saved.getCommunityId(), CommunityPostType.PROJECT, request.getTags());

    return saved.getCommunityId();
  }

  @Override
  public PostDetailResponse getProjectDetail(Long communityId, String userId) {
    ProjectEntity project = projectRepository.findById(communityId)
        .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트를 찾을 수 없습니다."));

    // 조회수 증가
    project.setViewCount(project.getViewCount() + 1);

    // 연관 데이터 조회
    List<String> tags = tagService.getTagNames(communityId);
    Long likeCount = likeService.getLikeCount(communityId, CommunityPostType.PROJECT);
    Long commentCount = commentService.getCommentCount(communityId, CommunityPostType.PROJECT);
    boolean isLiked = (userId != null) && likeService.isLiked(communityId, CommunityPostType.PROJECT, userId);

    return PostDetailResponse.of(
        project,
        CommunityPostType.PROJECT,
        tags,
        likeCount,
        commentCount,
        isLiked,
        userId
    );
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PostSummaryResponse> getProjectList(Pageable pageable) {
    return projectRepository.findAll(pageable)
        .map(project -> PostSummaryResponse.builder()
            .communityId(project.getCommunityId())
            .type(CommunityPostType.PROJECT)
            .title(project.getTitle())
            .authorId(project.getAuthorId())
            .createdAt(project.getCreatedAt())
            .viewCount(project.getViewCount())
            // 목록 조회 시 성능 이슈로 개수는 0 또는 별도 배치 처리 권장
            .likeCount(0)
            .commentCount(0)
            .tags(tagService.getTagNames(project.getCommunityId()))
            .status(project.getStatus())
            .deadline(project.getDeadline())
            .startDate(null)
            .content(project.getContent())
            .authorId(project.getAuthorId())
            .build());
  }

  @Override
  public void deleteProject(Long communityId, String userId) {
    ProjectEntity project = projectRepository.findById(communityId)
        .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

    if (!project.getAuthorId().equals(userId)) {
      throw new IllegalStateException("삭제 권한이 없습니다.");
    }

    tagService.updateTags(communityId, CommunityPostType.PROJECT, null); // 태그 삭제
    likeService.deleteLikes(communityId, CommunityPostType.PROJECT); // 좋아요 삭제
    projectRepository.delete(project); // 게시글 삭제
  }

}
