// component/blogService/PostTabs.tsx
import React from 'react';

interface PostTabsProps {
  activeTab: 'trending' | 'recent'|'friends';
  setActiveTab: (tab: 'trending' | 'recent'|'friends') => void;
}

const tabStyle = (isActive: boolean) => ({
  padding: '1px',
  cursor: 'pointer',
  fontWeight: isActive ? 'bold' : 'normal',
  color: isActive ? 'black' : '#555',
  borderBottom: isActive ? '2px solid black' : '2px solid transparent',
  marginRight: '15px',
  fontSize: '15px',
});

export default function PostTabs({ activeTab, setActiveTab }: PostTabsProps) {
  return (
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '10px' }}>

        {/* 인기 탭 */}
        <h2 style={tabStyle(activeTab === 'trending')} onClick={() => setActiveTab('trending')}>
          인기
        </h2>

        {/* 최신 탭 */}
        <h2 style={tabStyle(activeTab === 'recent')} onClick={() => setActiveTab('recent')}>
          최신
        </h2>
        {/* 최신 탭 */}
        <h2 style={tabStyle(activeTab === 'friends')} onClick={() => setActiveTab('friends')}>
          친구
        </h2>
      </div>
  );
}