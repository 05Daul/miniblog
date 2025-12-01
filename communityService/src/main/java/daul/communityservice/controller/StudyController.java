package daul.communityservice.controller;

import daul.communityservice.dto.CreateStudyRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import daul.communityservice.service.StudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
public class StudyController {

  private final StudyService studyService;

  /**
   * 스터디 게시글 작성
   * POST /community/studies
   */
  @PostMapping("/studies")
  public ResponseEntity<Long> createStudy(
      @Valid @RequestBody CreateStudyRequest request,
      @RequestHeader("userSignId") String userId) {

    Long communityId = studyService.createStudy(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(communityId);
  }

  /**
   * 스터디 게시글 상세 조회
   * GET /community/studies/{communityId}
   */
  @GetMapping("/studies/{communityId}")
  public ResponseEntity<PostDetailResponse> getStudyDetail(
      @PathVariable Long communityId,
      @RequestHeader(value = "userSignId", required = false) String userId) {

    PostDetailResponse response = studyService.getStudyDetail(communityId, userId);
    return ResponseEntity.ok(response);
  }

  /**
   * 스터디 게시글 목록 조회
   * GET /community/studies
   */
  @GetMapping("/studies")
  public ResponseEntity<Page<PostSummaryResponse>> getStudyList(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

    Page<PostSummaryResponse> studies = studyService.getStudyList(pageable);
    return ResponseEntity.ok(studies);
  }

  /**
   * 스터디 게시글 삭제
   * DELETE /community/studies/{communityId}
   */
  @DeleteMapping("/studies/{communityId}")
  public ResponseEntity<Void> deleteStudy(
      @PathVariable Long communityId,
      @RequestHeader("userSignId") String userId) {

    studyService.deleteStudy(communityId, userId);
    return ResponseEntity.noContent().build();
  }
}