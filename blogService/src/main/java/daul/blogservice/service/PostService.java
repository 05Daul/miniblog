package daul.blogservice.service;


import daul.blogservice.dto.PostCreationRequestDTO;
import daul.blogservice.entity.PostEntity;
import java.util.List;
import lombok.RequiredArgsConstructor;

public interface PostService {

  void deletePost(Long postId);

  PostEntity writePost(String authenticatedUserSignId,
      PostCreationRequestDTO postCreationRequestDTO);

  /**
   * postId를 기준으로 연결된 태그 이름들을 조회
   */
  List<String> getTagNamesByPostId(Long postId);

  /**
   * postId와 tagName을 받아서 태그를 게시글에 연결
   */
  void addTagToPost(Long postId, String tagName);

  /**
   * 여러 태그를 한번에 추가
   */
  void addTagsToPost(Long postId, List<String> tagNames);

  /**
   * 게시글에서 태그 제거
   */
  void removeTagFromPost(Long postId, String tagName);

  void incrementViewCount(Long postId);

}
