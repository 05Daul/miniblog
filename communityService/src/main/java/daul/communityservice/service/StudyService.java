package daul.communityservice.service;

import daul.communityservice.dto.CreateStudyRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudyService {
  Long createStudy(CreateStudyRequest request, String authorId);
  PostDetailResponse getStudyDetail(Long communityId, String userId);
  Page<PostSummaryResponse> getStudyList(Pageable pageable);
  void deleteStudy(Long communityId, String userId);
}
