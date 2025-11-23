// pages/post/[postId].tsx
import PostDetail from '@/component/blogService/PostDetail';
import { readPost } from '@/api/blogService/blog';
import { GetServerSideProps } from 'next';
import MainLayout from '@/component/layout/MainLayout';
import {PostEntity} from "@/types/blogService/blogType";   // 이거 추가!!!

export default function PostPage({ post }: { post: PostEntity }) {
  console.log("PostDetail 렌더링 시작. 수신된 Post:", post); // ⬅️ 이 로그가 찍히는지 확인
  if (!post) {
    return (
        <MainLayout>
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-2xl font-bold">게시물을 찾을 수 없습니다.</h1>
          </div>
        </MainLayout>
    );
  }

  return (
      <MainLayout>
        <PostDetail post={post} />
      </MainLayout>
);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { postId } = context.params!;

  try {
    const post = await readPost(Number(postId));
    return {
      props: { post },
    };
  } catch (error) {
    console.error("게시물 로드 실패:", error);
    return {
      props: { post: null },
    };
  }
};