import React from 'react';
import WritePage from '../component/blogService/WritePage';
import Layout from "../component/layout/MainLayout";

/**
 * Next.js의 /write 경로에 매핑되는 페이지 컴포넌트
 */
const WriteRoutePage: React.FC = () => {
  return (
      <Layout>
        <div>
          <WritePage/>
        </div>
      </Layout>
  );
};

export default WriteRoutePage;