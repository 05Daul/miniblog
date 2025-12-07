package daul.userservice.controller;

import daul.userservice.dto.FriendReqDto;
import daul.userservice.dto.FriendsResDto;
import daul.userservice.service.FriendsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendsController {

    private final FriendsService friendsService;

    /**
     * 친구 요청 보내기
     * POST /friends/request
     * Body: { "receiverSignId": "user123" }
     */
    @PostMapping("/request")
    public ResponseEntity<FriendsResDto> sendFriendRequest(
        @RequestBody FriendReqDto requestDto,
        @AuthenticationPrincipal String currentUserSignId) {

        FriendsResDto response = friendsService.sendFriendRequest(
            currentUserSignId,
            requestDto.getReceiverSignId()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 친구 요청 수락
     * PUT /friends/{friendId}/accept
     */
    @PutMapping("/{friendId}/accept")
    public ResponseEntity<FriendsResDto> acceptFriendRequest(
        @PathVariable Long friendId,
        @AuthenticationPrincipal String currentUserSignId) {

        FriendsResDto response = friendsService.acceptFriendRequest(
            friendId,
            currentUserSignId
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 친구 요청 거절
     * DELETE /friends/{friendId}/reject
     */
    @DeleteMapping("/{friendId}/reject")
    public ResponseEntity<Void> rejectFriendRequest(
        @PathVariable Long friendId,
        @AuthenticationPrincipal String currentUserSignId) {

        friendsService.rejectFriendRequest(friendId, currentUserSignId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 친구 삭제
     * DELETE /friends/{friendId}
     */
    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> deleteFriend(
        @PathVariable Long friendId,
        @AuthenticationPrincipal String currentUserSignId) {

        friendsService.deleteFriend(friendId, currentUserSignId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 유저 차단
     * POST /friends/block
     * Body: { "receiverSignId": "user123" }
     */
    @PostMapping("/block")
    public ResponseEntity<FriendsResDto> blockUser(
        @RequestBody FriendReqDto requestDto,
        @AuthenticationPrincipal String currentUserSignId) {

        FriendsResDto response = friendsService.blockUser(
            currentUserSignId,
            requestDto.getReceiverSignId()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 차단 해제
     * DELETE /friends/{friendId}/unblock
     */
    @DeleteMapping("/{friendId}/unblock")
    public ResponseEntity<Void> unblockUser(
        @PathVariable Long friendId,
        @AuthenticationPrincipal String currentUserSignId) {

        friendsService.unblockUser(friendId, currentUserSignId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 받은 친구 요청 목록 조회
     * GET /friends/requests/received
     */
    @GetMapping("/requests/received")
    public ResponseEntity<List<FriendsResDto>> getReceivedRequests(
        @AuthenticationPrincipal String currentUserSignId) {

        List<FriendsResDto> requests = friendsService.getReceivedRequests(
            currentUserSignId
        );

        return ResponseEntity.ok(requests);
    }

    /**
     * 보낸 친구 요청 목록 조회
     * GET /friends/requests/sent
     */
    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendsResDto>> getSentRequests(
        @AuthenticationPrincipal String currentUserSignId) {

        List<FriendsResDto> requests = friendsService.getSentRequests(
            currentUserSignId
        );

        return ResponseEntity.ok(requests);
    }

    /**
     * 친구 목록 조회
     * GET /friends
     */
    @GetMapping
    public ResponseEntity<List<FriendsResDto>> getFriendsList(
        @AuthenticationPrincipal String currentUserSignId) {

        List<FriendsResDto> friends = friendsService.getFriendsList(
            currentUserSignId
        );

        return ResponseEntity.ok(friends);
    }

    /**
     * 차단 목록 조회
     * GET /friends/blocked
     */
    @GetMapping("/blocked")
    public ResponseEntity<List<FriendsResDto>> getBlockedList(
        @AuthenticationPrincipal String currentUserSignId) {

        List<FriendsResDto> blockedUsers = friendsService.getBlockedList(
            currentUserSignId
        );

        return ResponseEntity.ok(blockedUsers);
    }

    /**
     * 특정 유저와의 친구 관계 상태 조회
     * GET /friends/status?targetUserId=xxx
     */
    @GetMapping("/status")
    public ResponseEntity<FriendsResDto> getFriendshipStatus(
        @RequestParam String targetUserId,
        @AuthenticationPrincipal String currentUserSignId) {

        FriendsResDto status = friendsService.getFriendshipStatus(
            currentUserSignId,
            targetUserId
        );

        if (status == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(status);
    }

    @PostMapping ("/msa")
    public ResponseEntity<List<String>> getFriendSignIds(
        @AuthenticationPrincipal String currentUserSignId) {

        List<String> friendIds = friendsService.getMSAFriendSignIds(currentUserSignId);

        return ResponseEntity.ok(friendIds);
    }
}