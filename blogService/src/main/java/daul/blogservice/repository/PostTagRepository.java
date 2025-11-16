package daul.blogservice.repository;

import daul.blogservice.entity.PostTagEntity;
import daul.blogservice.entity.PostTagId;
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
