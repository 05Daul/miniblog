import styles from "../../../styles/layout/layout.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoginModal from "../../userService/LoginModal";
import FriendActionModal from "@/component/userService/FriendActionModal";

// 💡 ChatSidebar import는 제거했습니다. (ChatPage로 이동할 것이기 때문)

export default function Topbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);

  // 💡 isChatOpen 상태도 제거했습니다. (페이지 이동 방식이므로 불필요)

  // 초기 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  };

  const handleLoginSuccess = () => {
    checkLoginStatus();
    setShowLoginModal(false); // 💡 로그인 성공 시 모달 닫기 추가
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    router.push("/");
  };

  // 로그인한 사용자 signId 가져오기
  const currentUserSignId = typeof window !== "undefined"
      ? localStorage.getItem("userSignId") || ""
      : "";

  return (
      <>
        <header className={styles.topbar}>
          <Link href="/" className={styles.leftSection}>
            MomenTory
          </Link>

          <nav className={styles.rightSection}>
            <div className={styles.rightItem}>검색</div>

            {isLoggedIn ? (
                <>
                  <Link href="/community" className={`${styles.rightItem} ${styles.navLink}`}>
                    커뮤니티
                  </Link>

                  {/* 친구 모달 버튼 */}
                  <div
                      className={styles.rightItem}
                      style={{cursor: 'pointer'}}
                      onClick={() => setShowFriendModal(true)}
                  >
                    친구
                    {showFriendModal && currentUserSignId && (
                        <FriendActionModal
                            currentUserSignId={currentUserSignId}
                            isOpen={showFriendModal}
                            // 💡 수정됨: 인자가 없는 함수를 전달합니다.
                            onClose={() => setShowFriendModal(false)}
                        />
                    )}
                  </div>

                  <div className={styles.rightItem}>알림</div>

                  {/* 💡 수정됨: 사이드바 열기 -> ChatPage로 이동 */}
                  <Link href="/page" className={`${styles.rightItem} ${styles.writeButton}`}>
                    채팅
                  </Link>

                  <Link href="/write" className={`${styles.rightItem} ${styles.writeButton}`}>
                    Log 작성
                  </Link>

                  <div className={styles.rightItem} onClick={handleLogout}
                       style={{cursor: 'pointer'}}>
                    로그아웃
                  </div>
                </>
            ) : (
                <div
                    className={styles.rightItem}
                    style={{cursor: "pointer"}}
                    // 💡 수정됨: false -> true (열기 동작)
                    onClick={() => setShowLoginModal(true)}
                >
                  로그인
                </div>
            )}
          </nav>
        </header>

        {showLoginModal && (
            <LoginModal
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        )}
      </>
  );
}