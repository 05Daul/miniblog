package daul.communityservice.repository;

import daul.communityservice.entity.tag.CommunityPostTagEntity;
import daul.communityservice.entity.tag.CommunityPostTagId;
import daul.communityservice.entity.tag.CommunityPostType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityPostTagRepository extends
    JpaRepository<CommunityPostTagEntity, CommunityPostTagId> {

/// 기본 조회

  // 특정 게시물에 달린 모든 태그 조회 (상세 페이지 필수)
  List<CommunityPostTagEntity> findByIdCommunityId(Long communityId);

  // 특정 태그가 달린 모든 게시물 조회 (태그 검색 결과)
  List<CommunityPostTagEntity> findByIdTagId(Long tagId);

  // 타입까지 정확히 맞춘 조회 (프로젝트인지 스터디인지 구분)
  List<CommunityPostTagEntity> findByIdCommunityIdAndCommunityType(
      Long communityId, CommunityPostType communityType);


  /// 관리용 / 삭제용


  // 특정 게시물의 모든 태그 삭제 (게시물 삭제 시 cascade 대신 직접 호출)
  void deleteByIdCommunityId(Long communityId);

  // 특정 태그 전체 삭제 (운영자가 태그 삭제할 때)
  void deleteByIdTagId(Long tagId);

  // 특정 타입 전체 태그 삭제 (예: 모든 PROJECT 태그 일괄 처리)
  void deleteByCommunityType(CommunityPostType communityType);

  // 중복 방지
  boolean existsByIdCommunityIdAndIdTagId(Long communityId, Long tagId);
  //@Query("SELECT pt FROM CommunityPostTagEntity pt JOIN FETCH pt.tag WHERE pt.id.communityId = :communityId")
 // List<CommunityPostTagEntity> findByCommunityIdWithTag(@Param("communityId") Long communityId);

}
