// src/component/blogService/WritePage.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Pages Router용 훅
import TiptapEditor from '../../component/TiptapEditor'; // 에디터 컴포넌트
import { writeFeed, readPost, updatePost } from '../../api/blogService/blog'; // API 함수
import { PostCreationRequestDTO } from '../../types/blogService/blogType'; // 타입 정의
import styles from '../../styles/blogService/write.module.css'; // CSS 모듈

// Props 타입 정의
interface WritePageProps {
  postId?: number; // 수정 모드일 때만 존재
}

const WritePage: React.FC<WritePageProps> = ({ postId }) => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]); // 태그 배열
  const [tagInput, setTagInput] = useState('');  // 태그 입력 필드
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false); // 초기 데이터 로드 플래그

  // 3. [수정 모드] 데이터 로드 로직
  useEffect(() => {
    if (postId && !isInitialLoad) {
      const loadPostData = async () => {
        try {
          setIsLoading(true);
          const data = await readPost(postId);
          setTitle(data.title);
          setContent(data.content);
          setTags(data.tags || []);
          setThumbnail(data.thumbnail || '');
        } catch (error) {
          console.error("데이터 로드 실패:", error);
          alert("게시글 정보를 불러오는데 실패했습니다.");
          router.back();
        } finally {
          setIsLoading(false);
          setIsInitialLoad(true);
        }
      };
      loadPostData();
    }
  }, [postId, isInitialLoad, router]);


  // 태그 입력 처리 (Enter 키로 태그 추가)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  // 4. [저장/수정] 핸들러 로직 분기
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const userSignId = localStorage.getItem('userSignId');
    if (!userSignId) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      if (postId) {
        // 🅰️ 수정 모드 (Update)
        const updateData: PostCreationRequestDTO = {
          title,
          content,
          tags,
          isPublished,
          thumbnail: thumbnail || undefined,
        };

        // blog.ts에 정의된 updatePost(postId, userSignId, postData) 호출
        await updatePost(postId, userSignId, updateData);

        alert("게시글이 성공적으로 수정되었습니다.");
        router.push(`/post/${postId}`); // 수정 후 상세 페이지로 이동

      } else {
        // 🅱️ 작성 모드 (Create)
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('isPublished', String(isPublished));
        if (thumbnail) formData.append('thumbnail', thumbnail);
        formData.append('tags', tags.join(',')); // 배열을 쉼표 문자열로 변환

        // 🚨 수정: writeFeed를 한 번만 호출하고, PostEntity 객체를 반환받습니다. (JSON.parse 불필요)
        const result = await writeFeed(formData, userSignId);

        // 🚨 수정: PostEntity 객체에서 postId를 직접 사용합니다.
        const newPostId = result.postId;

        if (newPostId) {
          alert("글이 성공적으로 등록되었습니다!");
          router.push(`/post/${newPostId}`);
        } else {
          // postId가 없는 경우를 위한 안전 장치
          alert("글이 등록되었으나 ID를 받지 못했습니다. 홈으로 이동합니다.");
          router.push('/');
        }
      }
    } catch (error) {
      console.error("작업 중 오류 발생:", error);
      alert("작업 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isInitialLoad) {
    return (
        <div className={styles.writePageContainer}>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
    );
  }

  return (
      <div className={styles.writePageContainer}>
        <div className={styles.writeHeader}>
          <h1 className={styles.writeTitle}>{postId ? "게시글 수정" : "순간과 순간이 모여 삶을 이루며"}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>제목</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="오늘의 이야기를 들려주세요"
                className={styles.titleInput}
                required
            />
          </div>

          <div>
            <label className={styles.label}>썸네일 URL (선택)</label>
            <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className={styles.textInput}
            />
          </div>

          <div>
            <label className={styles.label}>내용</label>
            <TiptapEditor content={content} onChange={setContent}/>
          </div>

          <div
              className={styles.tagInputGroup}
              style={!styles.tagInputGroup ? { marginBottom: '20px' } : undefined}
          >
            <label className={styles.label}>태그</label>

            {/* 태그 목록 표시 */}
            <div
                className={styles.tagList}
                style={!styles.tagList ? { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' } : undefined}
            >
              {tags.map(tag => (
                  <span
                      key={tag}
                      className={styles.tagItem}
                      style={!styles.tagItem ? { background: '#f1f3f5', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' } : undefined}
                  >
                #{tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className={styles.removeTagBtn}
                        style={!styles.removeTagBtn ? { border: 'none', background: 'none', cursor: 'pointer', marginLeft: '4px' } : undefined}
                    >
                    ×
                </button>
              </span>
              ))}
            </div>

            {/* 태그 입력 필드 */}
            <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="태그를 입력하고 Enter"
                className={styles.textInput}
            />
            <small className={styles.hint}>태그를 입력하고 엔터를 누르면 추가됩니다.</small>
          </div>
          <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className={styles.checkbox}
            />
            <label htmlFor="isPublished" className={styles.checkboxLabel}>
              {postId ? "수정 후 바로 게시하기" : "바로 게시하기"}
            </label>
          </div>

          <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
          >
            {isLoading ? "저장 중..." : postId ? "수정 완료" : "작성 완료하고 게시하기"}
          </button>
        </form>
      </div>
  );
};

export default WritePage;