package daul.communityservice.repository;

import daul.communityservice.entity.PostTagEntity;
import daul.communityservice.entity.PostTagId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface PostTagRepository extends JpaRepository <PostTagEntity, PostTagId>{

  List<PostTagEntity> findByPostTagId_PostId(Long postId);

  boolean existsByPostTagId_PostIdAndPostTagId_TagId(Long postId, Long tagId);

  @Modifying
  @Transactional
  void deleteByPostTagId_PostIdAndPostTagId_TagId(Long postId, Long tagId);
  @Modifying
  @Transactional
  void deleteByPostTagId_PostId(Long postId);
}
