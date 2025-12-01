// index.tsx
import Layout from "../component/layout/MainLayout";
import React, { useState } from "react";
import PostList from "../component/blogService/PostList";
// PostTabs 컴포넌트를 import 합니다. (경로에 맞게 수정 필요)
import PostTabs from "../component/blogService/PostTabs";


function MiniBlogContent() {
  const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending');

  return (
      <main>
        <Layout>
          <div style={{ padding: '10px 0' }}>

            <div style={{ padding: '0 10%', maxWidth: '1400px', margin: '0 auto' }}>

              {/* 탭 메뉴 */}
              <PostTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
              />

              <PostList postType={activeTab}/>

            </div>


          </div>
        </Layout>
      </main>
  );
}

export default function Home() {
  return <MiniBlogContent/>;
}