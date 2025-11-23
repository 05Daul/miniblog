import React from 'react';
import { useRouter } from 'next/router'; //
import WritePage from '@/component/blogService/WritePage';
import Layout from '@/component/layout/MainLayout';

const EditPostRoutePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  if (!router.isReady || !id) {
    return <div>로딩 중...</div>;
  }

  const postId = Number(id);

  return (
      <Layout>
        <div>
          <WritePage postId={postId} />
        </div>
      </Layout>
  );
};

export default EditPostRoutePage;