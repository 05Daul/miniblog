import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { login } from "../../api/userService/user"; // 중복 import 제거함
import { LoginDTO } from "../../types/userService/user"; // 타입 import 추가 권장

export default function Login() {
  const router = useRouter(); // 라우터 훅
  const [userSignId, setUserSignId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태

  async function loginHandleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 새로고침 방지
    setError(null); // 이전 에러 초기화

    const loginData: LoginDTO = {
      userSignId: userSignId,
      password: password,
    };

    try {
      // 2. API 호출
      console.log("로그인 요청 데이터:", loginData);
      const response = await login(loginData);

      console.log("로그인 성공:", response);

      // 3. 토큰 저장 (보안 수준에 따라 쿠키나 localStorage 선택)
      // 여기서는 편의상 localStorage를 예시로 듭니다.
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userSignId", response.userSignId);
      localStorage.setItem("role", response.role);

      // 4. 로그인 성공 후 페이지 이동 (예: 메인 페이지)
      router.push("/");

    } catch (err: any) {
      console.error("로그인 에러:", err);
      setError(err.message || "로그인 중 문제가 발생했습니다.");
    }
  }

  return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
        <h2>로그인</h2>
        <form onSubmit={loginHandleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* 아이디 입력 */}
          <div>
            <label htmlFor="userSignId">아이디</label>
            <input
                type="text"
                id="userSignId"
                value={userSignId}
                onChange={(e) => setUserSignId(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password">비밀번호</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          {/* 에러 메시지 표시 */}
          {error && <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>}

          {/* 제출 버튼 */}
          <button type="submit" style={{ padding: "10px", cursor: "pointer", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}>
            로그인
          </button>
        </form>
      </div>
  );
}