import styles from "../../../styles/layout/layout.module.css";
import Link from "next/link";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import LoginModal from "../../userService/LoginModal"; // (경로 확인 필요)

export default function Topbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // 모달 표시 상태

  // 초기 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  };

  // 로그인 성공 시 호출될 함수
  const handleLoginSuccess = () => {
    checkLoginStatus(); // 상태 갱신 (로그인 버튼 -> 마이페이지로 변경됨)
    // 필요하면 router.reload() 혹은 router.push('/') 등을 추가
  };

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    router.push("/");
  };

  return (
      <>
        <header className={styles.topbar}>
          {/* 왼쪽 로고 */}
          <Link href="/" className={styles.leftSection}>
           MomenTory
          </Link>

          {/* 오른쪽 메뉴 */}
          <nav className={styles.rightSection}>
            <div className={styles.rightItem}>검색</div>

            {isLoggedIn ? (
                <>
                  <Link href="/community" className={`${styles.rightItem} ${styles.navLink}`}>
                      커뮤니티
                  </Link>
                  <div className={styles.rightItem}>알림</div>
                  <div className={styles.rightItem}>채팅</div>
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
                    onClick={() => setShowLoginModal(true)}
                >
                  로그인
                </div>
            )}
          </nav>
        </header>

        {/* 모달 렌더링 (showLoginModal이 true일 때만) */}
        {showLoginModal && (
            <LoginModal
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        )}
      </>
  );
}