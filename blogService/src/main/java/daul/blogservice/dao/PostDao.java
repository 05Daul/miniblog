package daul.blogservice.dao;

import daul.blogservice.dto.PostCreationRequestDTO;
import daul.blogservice.entity.PostEntity;
import java.util.Optional;

public interface PostDao {
  PostEntity writePost(PostEntity post);
  void deletePost(Long postId);
  Optional<PostEntity> findById(Long id);
  int incrementViewCount(Long postId);


}
