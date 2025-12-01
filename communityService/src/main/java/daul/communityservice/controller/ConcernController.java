// ConcernController.java
package daul.communityservice.controller;

import daul.communityservice.dto.CreateConcernRequest;
import daul.communityservice.dto.PostDetailResponse;
import daul.communityservice.dto.PostSummaryResponse;
import daul.communityservice.service.ConcernService;
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
public class ConcernController {

  private final ConcernService concernService;

  @PostMapping("/concerns")
  public ResponseEntity<Long> createConcern(
      @Valid @RequestBody CreateConcernRequest request,
      @RequestHeader("userSignId") String userId) {
    Long communityId = concernService.createConcern(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(communityId);
  }

  @GetMapping("/concerns/{communityId}")
  public ResponseEntity<PostDetailResponse> getConcernDetail(
      @PathVariable Long communityId,
      @RequestHeader(value = "userSignId", required = false) String userId) {
    PostDetailResponse response = concernService.getConcernDetail(communityId, userId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/concerns")
  public ResponseEntity<Page<PostSummaryResponse>> getConcernList(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    Page<PostSummaryResponse> concerns = concernService.getConcernList(pageable);
    return ResponseEntity.ok(concerns);
  }

  @DeleteMapping("/concerns/{communityId}")
  public ResponseEntity<Void> deleteConcern(
      @PathVariable Long communityId,
      @RequestHeader("userSignId") String userId) {
    concernService.deleteConcern(communityId, userId);
    return ResponseEntity.noContent().build();
  }
}