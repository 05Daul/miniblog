package daul.communityservice.service;

import daul.communityservice.dto.CreateConcernRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConcernService {
  Long createConcern(CreateConcernRequest request, String authorId);
  PostDetailResponse getConcernDetail(Long communityId, String userId);
  Page<PostSummaryResponse> getConcernList(Pageable pageable);
  void deleteConcern(Long communityId, String userId);
}
