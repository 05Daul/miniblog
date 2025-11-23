import React, { useState, FormEvent } from "react";
import styles from "../../styles/userService/LoginModal.module.css"; // 위에서 만든 CSS 경로에 맞게 수정하세요
import { login } from "../../api/userService/user";
import { useRouter } from "next/router";
import Link from "next/link";

interface LoginModalProps {
  onClose: () => void; // 닫기 버튼 클릭 시 실행할 함수
  onLoginSuccess: () => void; // 로그인 성공 시 실행할 함수 (상태 업데이트용)
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const router = useRouter();
  const [userSignId, setUserSignId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 로그인 핸들러
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const response = await login({ userSignId, password });

      // 토큰 저장
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userSignId", response.userSignId);

      alert("환영합니다!");
      onLoginSuccess(); // Topbar의 상태를 로그인 됨으로 변경
      onClose(); // 모달 닫기

    } catch (err: any) {
      console.error(err);
      setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  }// LoginModal.tsx (최고의 로그인 모달)
  return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modalBox} onClick={e => e.stopPropagation()}>

          {/* 왼쪽: 감성 일러스트 영역 */}
          <div className={styles.leftSection}>
            <div className={styles.illustration}>
              <span role="img" aria-label="sparkles" style={{ fontSize: "4rem" }}>✨</span>
            </div>
            <h2 className={styles.welcomeText}> 다시 만나서 반가워요</h2>
            <p className={styles.welcomeSub}>오늘도 소중한 순간을 기록해볼까요?</p>
          </div>

          {/* 오른쪽: 로그인 폼 */}
          <div className={styles.rightSection}>
            <button className={styles.closeButton} onClick={onClose}>×</button>

            <h2 className={styles.title}>로그인</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input type="text" className={styles.input} placeholder="아이디" value={userSignId} onChange={e => setUserSignId(e.target.value)} />
              <input type="password" className={styles.input} placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />

              {error && <div className={styles.errorMessage}>{error}</div>}

              <button type="submit" className={styles.loginButton}>
                로그인
              </button>
            </form>

            <div className={styles.footer}>
              아직 계정이 없나요? <Link href="/signup" className={styles.signupLink} onClick={onClose}>회원가입</Link>
            </div>
          </div>
        </div>
      </div>
  );

  // return (
  //     <div className={styles.overlay} onClick={onClose}>
  //       {/* 모달 내부 클릭 시 닫히지 않도록 stopPropagation */}
  //       <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
  //
  //         {/* --- 왼쪽: 환영 이미지 섹션 --- */}
  //         <div className={styles.leftSection}>
  //           {/* 여기에 이미지를 넣으세요. 예: <img src="/welcome.png" width={150} /> */}
  //           <div style={{ fontSize: "5rem" }}>👋</div> {/* 임시 이모지 */}
  //           <div className={styles.welcomeText}>환영합니다!</div>
  //         </div>
  //
  //         {/* --- 오른쪽: 로그인 폼 섹션 --- */}
  //         <div className={styles.rightSection}>
  //           <button className={styles.closeButton} onClick={onClose}>✕</button>
  //
  //           <h2 className={styles.title}>로그인</h2>
  //           <p className={styles.subTitle}>아이디/비밀번호로 로그인</p>
  //
  //           <form onSubmit={handleSubmit} className={styles.form}>
  //             <input
  //                 type="text"
  //                 className={styles.input}
  //                 placeholder="아이디를 입력하세요."
  //                 value={userSignId}
  //                 onChange={(e) => setUserSignId(e.target.value)}
  //             />
  //             <input
  //                 type="password"
  //                 className={styles.input}
  //                 placeholder="비밀번호를 입력하세요."
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //             />
  //
  //             {error && <div style={{color: 'red', fontSize: '0.8rem'}}>{error}</div>}
  //
  //             <button type="submit" className={styles.loginButton}>로그인</button>
  //           </form>
  //
  //           {/* 소셜 로그인 (모양만 구현) */}
  //           <div className={styles.socialSection}>
  //             <span className={styles.socialLabel}>소셜 계정으로 로그인</span>
  //             <div className={styles.socialIcons}>
  //               <button className={styles.iconButton}>🐱</button> {/* GitHub */}
  //               <button className={styles.iconButton}>G</button> {/* Google */}
  //               <button className={styles.iconButton}>f</button> {/* Facebook */}
  //             </div>
  //           </div>
  //
  //           <div className={styles.footer}>
  //             아직 회원이 아니신가요?{" "}
  //             <Link href="/signup" className={styles.signupLink} onClick={onClose}>
  //               회원가입
  //             </Link>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  // );
}