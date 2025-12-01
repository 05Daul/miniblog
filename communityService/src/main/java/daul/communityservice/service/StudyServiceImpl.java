package daul.communityservice.service;

import daul.communityservice.dto.CreateStudyRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import daul.communityservice.entity.study.StudyEntity;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.repository.StudyRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class StudyServiceImpl implements StudyService {


  private final StudyRepository studyRepository;
  private final TagService tagService;
  private final LikeService likeService;
  private final CommentService commentService;


  @Override
  public Long createStudy(CreateStudyRequest request, String authorId) {
    StudyEntity study = StudyEntity.builder()
        .authorId(authorId)
        .title(request.getTitle())
        .content(request.getContent())
        .startDate(request.getStartDate())
        .schedule(request.getSchedule())
        .format(request.getFormat())
        .status(request.getStatus())
        .viewCount(0)
        .build();

    StudyEntity saved = studyRepository.save(study);
    tagService.updateTags(saved.getCommunityId(), CommunityPostType.STUDY, request.getTags());

    return saved.getCommunityId();
  }

  @Override
  public PostDetailResponse getStudyDetail(Long communityId, String userId) {
    StudyEntity study = studyRepository.findById(communityId)
        .orElseThrow(() -> new IllegalArgumentException("해당 스터디를 찾을 수 없습니다."));

    study.setViewCount(study.getViewCount() + 1);

    List<String> tags = tagService.getTagNames(communityId);
    Long likeCount = likeService.getLikeCount(communityId, CommunityPostType.STUDY);
    Long commentCount = commentService.getCommentCount(communityId, CommunityPostType.STUDY);
    boolean isLiked = (userId != null) && likeService.isLiked(communityId, CommunityPostType.STUDY, userId);

    return PostDetailResponse.of(
        study,
        CommunityPostType.STUDY,
        tags,
        likeCount,
        commentCount,
        isLiked,
        userId
    );
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PostSummaryResponse> getStudyList(Pageable pageable) {
    return studyRepository.findAll(pageable)
        .map(study -> PostSummaryResponse.builder()
            .communityId(study.getCommunityId())
            .type(CommunityPostType.STUDY)
            .title(study.getTitle())
            .authorId(study.getAuthorId())
            .createdAt(study.getCreatedAt())
            .viewCount(study.getViewCount())
            .likeCount(0)
            .commentCount(0)
            .tags(tagService.getTagNames(study.getCommunityId()))
            .deadline(null)
            .startDate(study.getStartDate())
            .content(study.getContent())
            .authorId(study.getAuthorId())
            .build());
  }

  @Override
  public void deleteStudy(Long communityId, String userId) {
    StudyEntity study = studyRepository.findById(communityId)
        .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
    if (!study.getAuthorId().equals(userId)) throw new IllegalStateException("삭제 권한이 없습니다.");

    tagService.updateTags(communityId, CommunityPostType.STUDY, null);
    likeService.deleteLikes(communityId, CommunityPostType.STUDY);
    studyRepository.delete(study);
  }
}