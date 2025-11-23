import React from 'react';
import Topbar from './Bar/Topbar'; // Topbar 컴포넌트 경로에 맞게 수정
interface LayoutProps {
  children: React.ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  return (
      <>
        <Topbar />
        <main>
          {children}
        </main>
      </>
  );
}