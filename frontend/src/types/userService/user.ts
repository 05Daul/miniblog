/**
 * 유저 서비스 - 친구
 * */
export interface FriendsEntity {
  friendId: number;
  requester: UserEntity;
  receiver: UserEntity;
  friendsStatus: FriendsStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export enum FriendsStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED'
}

export interface FriendReqDTO {
  receiverSignId: string;
}

export interface FriendsResDTO {
  friendId: number;
  requesterSignId: string;
  receiverSignId: string
  friendsStatus: FriendsStatus;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * 유저 서비스 - 회원가입
 * */

export enum RoleName {
  USER = 'USER',
  ADMIN = "ADMIN"
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  SUSPENDED = 'SUSPENDED'
}


export interface UserEntity {
  userSignId: String;
  email: String;
  userName: String;
  nickName: String;
  password: String;
  roleName: RoleName;
  status: UserStatus;
  createdAt: Date;
  updatedAt?: Date;
  profile_img?: String;
}

/**
 * 로그인
 * */
export interface LoginDTO {
  userSignId: string;
  password: string;
}

export interface UserDTO {
  userSignId: string
  email: string
  userName: string
  nickName: string
  password: string
  profile_img: string
}