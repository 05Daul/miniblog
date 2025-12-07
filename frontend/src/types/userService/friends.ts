// types/friends.ts

export type FriendsStatus = "PENDING" | "ACCEPTED" | "BLOCKED";

export interface FriendsResDTO {
  friendId: number;
  requesterSignId: string;
  receiverSignId: string;
  friendsStatus: FriendsStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface FriendReqDTO {
  receiverSignId: string;
}