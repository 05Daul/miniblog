package daul.blogservice.service;

import daul.blogservice.dto.CommentDTO;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import daul.blogservice.dao.PostDao;
import daul.blogservice.dao.PostTagDao;
import daul.blogservice.dao.TagDao;
import daul.blogservice.dto.PostCreationRequestDTO;
import daul.blogservice.entity.CommentEntity;
import daul.blogservice.entity.PostEntity;
import daul.blogservice.entity.PostTagEntity;
import daul.blogservice.entity.PostTagId;
import daul.blogservice.entity.TagEntity;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

  private final PostTagDao postTagDao;
  private final PostDao postDao;
  private final TagDao tagDao;

  // 게시물 삭제
  @Transactional
  @Override
  public void deletePost(Long postId) {
    PostEntity post = postDao.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

    // 단방향 관계이므로 수동으로 PostTag 먼저 삭제
    postTagDao.deleteByPostId(postId);

    // 게시글 삭제
    postDao.deletePost(postId);
  }

  @Override
  @Transactional
  public PostEntity updatePost(String authenticatedUserSignId,Long postId, PostCreationRequestDTO postCreationRequestDTO) {
    PostEntity post = postDao.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + postId));

    post.setTitle(postCreationRequestDTO.getTitle());
    post.setContent(postCreationRequestDTO.getContent());
    if (postCreationRequestDTO.getThumbnail() != null) {
      post.setThumbnail(postCreationRequestDTO.getThumbnail());
    }

    List<String> newTags = postCreationRequestDTO.getTags();
    if (newTags != null) {
      postTagDao.deleteByPostId(postId);

      if (!newTags.isEmpty()) {
        addTagsToPost(postId, newTags);
      }
    }
    return postDao.writePost(post);
  }

  @Transactional

  @Override
  public PostEntity readPost(Long postId) {
    return postDao.findById(postId)
        .orElseThrow(() -> new RuntimeException("게시물이 존재하지 않습니다."));
  }

  @Override
  @Transactional(readOnly = true)
  public List<String> getTagNamesByPostId(Long postId) {
    List<PostTagEntity> postTags = postTagDao.findByPostId(postId);

    return postTags.stream()
        .map(postTag -> postTag.getTag().getTagName())
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void addTagToPost(Long postId, String tagName) {
    PostEntity post = postDao.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));

    // 태그 조회 또는 생성
    TagEntity tag = tagDao.findByTagName(tagName)
        .orElseGet(() -> {
          TagEntity newTag = new TagEntity();
          newTag.setTagName(tagName);
          return tagDao.save(newTag);
        });

    // 이미 연결되어 있는지 확인
    boolean exists = postTagDao.existsByPostIdAndTagId(postId, tag.getTagId());

    if (exists) {
      throw new IllegalStateException("이미 해당 태그가 게시글에 연결되어 있습니다.");
    }

    // PostTag 생성 및 저장
    PostTagId postTagId = new PostTagId(postId, tag.getTagId());
    PostTagEntity postTag = new PostTagEntity();
    postTag.setPostTagId(postTagId);
    postTag.setPost(post);
    postTag.setTag(tag);

    postTagDao.save(postTag);
  }

  @Override
  @Transactional
  public void addTagsToPost(Long postId, List<String> tagNames) {
    if (tagNames == null || tagNames.isEmpty()) {
      return;
    }

    for (String tagName : tagNames) {
      try {
        addTagToPost(postId, tagName);
      } catch (IllegalStateException e) {
        // 이미 존재하는 태그는 건너뛰기
      }
    }
  }

  @Override
  @Transactional
  public void removeTagFromPost(Long postId, String tagName) {
    TagEntity tag = tagDao.findByTagName(tagName)
        .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다: " + tagName));

    postTagDao.deleteByPostIdAndTagId(postId, tag.getTagId());
  }

  @Override
  @Transactional
  public PostEntity writePost(String authenticatedUserSignId,
      PostCreationRequestDTO postCreationRequestDTO) {

    // 1. PostEntity 생성
    PostEntity writeEntity = new PostEntity();
    writeEntity.setPost(
        authenticatedUserSignId,
        postCreationRequestDTO.getTitle(),
        postCreationRequestDTO.getContent(),
        postCreationRequestDTO.getIsPublished(),
        postCreationRequestDTO.getThumbnail()
    );

    // 2. Post 저장 (postId 생성됨)
    PostEntity savedPost = postDao.writePost(writeEntity);

    // 3. 태그가 있다면 추가
    if (postCreationRequestDTO.getTags() != null &&
        !postCreationRequestDTO.getTags().isEmpty()) {
      addTagsToPost(savedPost.getPostId(), postCreationRequestDTO.getTags());
    }

    return savedPost;
  }

  @Transactional
  @Override
  public void incrementViewCount(Long postId) {
    postDao.incrementViewCount(postId);
  }


  /* @Transactional(readOnly = true)
   @Override
   public Page<PostEntity> getFeedPosts(String currentUserId, Pageable pageable) {
    *//* List<String> followedAuthorIds = followService.getFollowedUserIds(currentUserId);

    if (followedAuthorIds.isEmpty()) {
      return Page.empty(pageable);
   *//* }

    return postDao.findFeedPostsByAuthorIds(followedAuthorIds, pageable);
  }
*/
  @Transactional(readOnly = true)
  @Override
  public Page<PostEntity> getRecentPosts(Pageable pageable) {
    return postDao.getRecentPosts(pageable);
  }

  @Transactional(readOnly = true)
  @Override
  public Page<PostEntity> getTrendingPosts(Pageable pageable) {
    LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
    return postDao.findTrendingPosts(sevenDaysAgo,pageable);
  }

  private CommentDTO convertToDTOWithChildren(CommentEntity entity) {
    List<CommentDTO> children = entity.getChildComments().stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());

    return CommentDTO.builder()
        .commentId(entity.getCommentId())
        .postId(entity.getPostId())
        .userId(entity.getUserId())
        .parentId(
            entity.getParentComment() != null ? entity.getParentComment().getCommentId() : null)
        .content(entity.getContent())
        .isDeleted(entity.getIsDeleted())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .childComments(children)
        .childCount(children.size())
        .build();
  }

  // Entity -> DTO 변환 (단순)
  private CommentDTO convertToDTO(CommentEntity entity) {
    return CommentDTO.builder()
        .commentId(entity.getCommentId())
        .postId(entity.getPostId())
        .userId(entity.getUserId())
        .parentId(
            entity.getParentComment() != null ? entity.getParentComment().getCommentId() : null)
        .content(entity.getContent())
        .isDeleted(entity.getIsDeleted())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .childCount(0)
        .build();
  }
}