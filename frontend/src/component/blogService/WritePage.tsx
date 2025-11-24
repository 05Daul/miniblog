// src/component/blogService/WritePage.tsx

import React, {
  useState,
  useEffect,
  FormEvent,
  useCallback,
  useRef
} from 'react';
import { useRouter } from 'next/router';
import TiptapEditor from '../../component/TiptapEditor';
import {
  writeFeed,
  readPost,
  updatePost,
  uploadImage,
  getPostTags
} from '../../api/blogService/blog';
import { PostCreationRequestDTO, PostEntity } from '../../types/blogService/blogType';
import styles from '../../styles/blogService/write.module.css';

// Props 타입 정의
interface WritePageProps {
  postId?: number; // 수정 모드일 때만 존재
}

const WritePage: React.FC<WritePageProps> = ({ postId }) => {
  const router = useRouter();
  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [isPublished, setIsPublished] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [userSignId, setUserSignId] = useState<string | null>(null);

  // 1. [사용자 ID 로드]
  useEffect(() => {
    const id = localStorage.getItem('userSignId');
    if (id) {
      setUserSignId(id);
    }
  }, [router]);


  // 2. [수정 모드] 데이터 로드 로직
  useEffect(() => {
    if (postId && !isInitialLoad) {
      const loadPostData = async () => {
        try {
          setIsLoading(true);
          const data = await readPost(postId);

          setTitle(data.title);
          setContent(data.content);
          const loadedTags = await getPostTags(postId);
          setTags(loadedTags);
          console.log(loadedTags)
          setThumbnailUrl(data.thumbnail || null);
          setIsPublished(data.isPublished);
        } catch (error) {
          console.error("데이터 로드 실패:", error);
          // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
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


  // 3. 태그 관리 로직
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ⚠️ [핵심 수정] 한글 조합(Composition) 중이라면 Enter, Spacebar 처리 스킵
    // '가나다라' 입력 후 ' ' (공백) 입력 시 '라'가 분리되는 버그 방지
    if (isComposing) {
      return;
    }

    // Enter 또는 Spacebar를 눌렀을 때
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim();

      // 태그가 실제로 입력되었고, 기존 태그 목록에 포함되어 있지 않을 때만 추가
      if (newTag.length > 0 && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput(''); // 입력 필드 초기화
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  // 썸네일 파일 업로드 핸들러
  const handleThumbnailUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsThumbnailUploading(true);
    try {
      const result = await uploadImage(file);
      const url = (result as any).url;
      setThumbnailUrl(url);
      // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
      alert('썸네일 업로드 완료');
    } catch (error) {
      console.error('썸네일 업로드 실패:', error);
      // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
      alert('썸네일 업로드에 실패했습니다. (콘솔 확인)');
      setThumbnailUrl(null);
    } finally {
      setIsThumbnailUploading(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  }, []);


  // 4. [저장/수정] 핸들러 로직
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (!userSignId) {
      // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      const postData: PostCreationRequestDTO = {
        title,
        content,
        tags,
        isPublished,
        thumbnail: thumbnailUrl || undefined,
      };

      let resultPost: PostEntity;

      if (postId) {
        resultPost = await updatePost(postId, postData, userSignId);
        // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
        alert("게시글이 성공적으로 수정되었습니다.");
        router.push(`/post/${postId}`);

      } else {
        resultPost = await writeFeed(postData, userSignId);

        if (resultPost.postId) {
          // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
          alert("글이 성공적으로 등록되었습니다!");
          router.push(`/post/${resultPost.postId}`);
        } else {
          // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
          alert("글이 등록되었으나 ID를 받지 못했습니다. 홈으로 이동합니다.");
          router.push('/');
        }
      }

    } catch (error) {
      console.error("작업 중 오류 발생:", error);
      // ⚠️ alert 대신 사용자 정의 모달 또는 인라인 메시지 사용 권장
      alert("작업 중 오류가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요.");
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


        <form onSubmit={handleSubmit} className={styles.form}>

          {/* ======================================================= */}
          {/* 제목과 썸네일을 감싸는 그룹 컨테이너 (1열/세로) */}
          {/* ======================================================= */}
          <div className={styles.titleThumbnailGroup}>

            {/* 1. 제목 입력 (titleInputWrapper) */}
            <div className={styles.titleInputWrapper}>
              <div className={styles.writeHeader}>
                <h1 className={styles.writeTitle}>{postId ? "게시글 수정" : "순간과 순간이 모여 삶을 이루며"}</h1>
              </div>
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

            {/* 2. 썸네일 섹션 */}
            <div className={styles.thumbnailSection}>
              <h3>대표 썸네일 설정</h3>
              <div
                  className={styles.thumbnailWrapper}
                  onClick={() => !isThumbnailUploading && thumbnailInputRef.current?.click()}
                  // 동적 커서 스타일만 인라인으로 유지.
                  style={{
                    cursor: isThumbnailUploading ? 'not-allowed' : 'pointer',
                  }}
              >
                {thumbnailUrl ? (
                    // 썸네일 미리보기
                    <img
                        src={thumbnailUrl}
                        alt="Thumbnail Preview"
                        className={styles.thumbnailPreview}
                    />
                ) : (
                    // 업로드 버튼/안내 텍스트
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      {isThumbnailUploading ? '업로드 중...' : '클릭하여 썸네일 이미지 업로드 (선택 사항)'}
                    </div>
                )}
                {/* 실제 파일 입력 (숨김) */}
                <input
                    type="file"
                    ref={thumbnailInputRef}
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    style={{ display: 'none' }}
                    disabled={isThumbnailUploading}
                />
              </div>

              {/* 썸네일 제거 버튼 */}
              {thumbnailUrl && (
                  <button
                      type="button"
                      onClick={() => setThumbnailUrl(null)}
                      disabled={isThumbnailUploading}
                      className={styles.removeThumbnailBtn}
                  >
                    썸네일 제거
                  </button>
              )}
            </div>
            {/* 썸네일 섹션 끝 */}
          </div>
          {/* titleThumbnailGroup 끝 */}
          {/* ======================================================= */}


          <div>
            <label className={styles.label}>내용</label>
            <TiptapEditor
                content={content}
                onChange={setContent}
            />
          </div>

          <div className={styles.tagInputGroup}>
            <label className={styles.label}>태그</label>

            {/* 태그 목록 표시 */}
            <div className={styles.tagList}>
              {tags.map(tag => (
                  <span
                      key={tag}
                      className={styles.tagItem}
                  >
                #{tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className={styles.removeTagBtn}
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
                // ✅ 한글 조합 시작/종료 이벤트 추가
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
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
              disabled={isLoading || isThumbnailUploading}
              className={styles.submitButton}
          >
            {isLoading ? "저장 중..." : postId ? "수정 완료" : "작성 완료하고 게시하기"}
          </button>
        </form>
      </div>
  );
};

export default WritePage;