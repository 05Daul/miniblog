package daul.communityservice.dao;

import daul.communityservice.entity.PostTagEntity;
import java.util.List;

public interface PostTagDao {

  List<PostTagEntity> findByPostId(Long postId);

  boolean existsByPostIdAndTagId(Long postId, Long tagId);

  void save(PostTagEntity postTag);

  void deleteByPostIdAndTagId(Long postId, Long tagId);

  void deleteByPostId(Long postId);


}
