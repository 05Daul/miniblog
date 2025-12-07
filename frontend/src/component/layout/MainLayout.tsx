import React from 'react';
import Topbar from './Bar/Topbar';
import styles from '@/styles/layout/MainLayout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
      <div className={styles.layoutContainer}>
        <Topbar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
  );
}