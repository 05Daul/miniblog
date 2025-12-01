package daul.communityservice.service;

import daul.communityservice.dto.CreateConcernRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import daul.communityservice.entity.concern.ConcernEntity;
import daul.communityservice.entity.tag.CommunityPostType;
import daul.communityservice.repository.ConcernRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ConcernServiceImpl implements ConcernService {

  private final ConcernRepository concernRepository;
  private final TagService tagService;
  private final LikeService likeService;
  private final CommentService commentService;

  @Override
  public Long createConcern(CreateConcernRequest request, String authorId) {
    ConcernEntity concern = ConcernEntity.builder()
        .authorId(authorId)
        .title(request.getTitle())
        .content(request.getContent())
        .isResolved(false)
        .viewCount(0)
        .build();

    ConcernEntity saved = concernRepository.save(concern);
    tagService.updateTags(saved.getCommunityId(), CommunityPostType.CONCERN, request.getTags());

    return saved.getCommunityId();
  }

  @Override
  public PostDetailResponse getConcernDetail(Long communityId, String userId) {
    ConcernEntity concern = concernRepository.findById(communityId)
        .orElseThrow(() -> new IllegalArgumentException("해당 고민 게시글을 찾을 수 없습니다."));

    concern.setViewCount(concern.getViewCount() + 1);

    List<String> tags = tagService.getTagNames(communityId);
    Long likeCount = likeService.getLikeCount(communityId, CommunityPostType.CONCERN);
    Long commentCount = commentService.getCommentCount(communityId, CommunityPostType.CONCERN);
    boolean isLiked =
        (userId != null) && likeService.isLiked(communityId, CommunityPostType.CONCERN, userId);

    return PostDetailResponse.of(
        concern,
        CommunityPostType.CONCERN,
        tags,
        likeCount,
        commentCount,
        isLiked,
        userId
    );
  }

  // getList, delete 구현... (위와 동일 패턴)
  @Override
  @Transactional(readOnly = true)
  public Page<PostSummaryResponse> getConcernList(Pageable pageable) {
    return concernRepository.findAll(pageable)
        .map(concern -> PostSummaryResponse.builder()
            .communityId(concern.getCommunityId())
            .type(CommunityPostType.CONCERN)
            .title(concern.getTitle())
            .authorId(concern.getAuthorId())
            .createdAt(concern.getCreatedAt())
            .viewCount(concern.getViewCount())
            .likeCount(0)
            .commentCount(0)
            .tags(tagService.getTagNames(concern.getCommunityId()))
            .status(null)
            .deadline(null)
            .startDate(null)
            .content(concern.getContent())
            .authorId(concern.getAuthorId())
            .build());
  }

  @Override
  public void deleteConcern(Long communityId, String userId) {
    ConcernEntity concern = concernRepository.findById(communityId)
        .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
    if (!concern.getAuthorId().equals(userId)) {
      throw new IllegalStateException("삭제 권한이 없습니다.");
    }

    tagService.updateTags(communityId, CommunityPostType.CONCERN, null);
    likeService.deleteLikes(communityId, CommunityPostType.CONCERN);
    concernRepository.delete(concern);


  }

}