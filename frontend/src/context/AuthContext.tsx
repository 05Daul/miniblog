import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userSignId: string | null;
  login: (signId: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userSignId, setUserSignId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 💡 앱 실행 시 localStorage에서 로그인 정보 확인 (새로고침 유지)
  useEffect(() => {
    const storedUserSignId = localStorage.getItem("userSignId");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUserSignId && storedToken) {
      setUserSignId(storedUserSignId);
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인 처리 (실제 로그인 성공 후 호출)
  const login = (signId: string, token: string) => {
    localStorage.setItem("userSignId", signId);
    localStorage.setItem("accessToken", token); // 토큰 저장
    setUserSignId(signId);
    setIsLoggedIn(true);
  };

  // 로그아웃 처리
  const logout = () => {
    localStorage.removeItem("userSignId");
    localStorage.removeItem("accessToken");
    setUserSignId(null);
    setIsLoggedIn(false);
  };

  const value = {
    isLoggedIn,
    userSignId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};