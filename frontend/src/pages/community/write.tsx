// src/pages/community/write.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/component/layout/MainLayout';
import SimpleTiptapEditor from '@/component/communityService/SimpleTiptapEditor';
import styles from '@/styles/community/CommunityWrite.module.css';
import {
  createConcern,
  createProject,
  createStudy
} from '@/api/communityService/community';
import {
  CreateConcernRequest,
  CreateProjectRequest,
  CreateStudyRequest,
  CommunityPostType,
  RecruitmentStatus,
  PostFormat
} from '@/types/communityService/communityType';

export default function CommunityWrite() {
  const router = useRouter();
  const [userSignId, setUserSignId] = useState<string>('');
  const [postType, setPostType] = useState<CommunityPostType>(CommunityPostType.CONCERN);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [format, setFormat] = useState<PostFormat | ''>('');
  const [deadline, setDeadline] = useState<string>('');
  const [teamSize, setTeamSize] = useState<number | ''>(''); // number | '' 상태로 유지
  const [recruitmentStatus, setRecruitmentStatus] = useState<RecruitmentStatus>('RECRUITING' as RecruitmentStatus);

  // STUDY 전용 필드
  const [startDate, setStartDate] = useState<string>('');
  const [schedule, setSchedule] = useState<string>('');

  useEffect(() => {
    const userId = localStorage.getItem('userSignId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    setUserSignId(userId);
  }, [router]); // router를 의존성 배열에 추가

  const handleTagAdd = () => {
    const trimmedTag = tagInput.trim();

    if (trimmedTag.length < 2 || tags.includes(trimmedTag) || tags.length >= 5) {
      setTagInput('');
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput(''); // 태그 추가 후 입력 상태를 확실히 비웁니다.
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !(e.nativeEvent as any).isComposing) {
      e.preventDefault();
      e.stopPropagation(); // 이벤트 전파 중단 (이전 수정 사항 유지)
      handleTagAdd();
    }
  };
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      alert('내용을 입력해주세요.');
      return;
    }

    // ✨ [수정] 타입별 유효성 검사 로직
    if (postType === CommunityPostType.PROJECT) {
      if (!format) {
        alert('진행 방식은 필수입니다.');
        return;
      }
      if (!deadline) {
        alert('마감일은 필수입니다.');
        return;
      }

      // ✅ [추가] 클라이언트 측 날짜 유효성 검사: 마감일이 오늘 이후인지 확인 (시간 무시)
      const today = new Date();
      // 시간 정보를 00:00:00으로 설정하여 날짜만 비교 가능하게 조정
      today.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(0, 0, 0, 0); // 혹시 모를 브라우저 해석 차이 방지

      if (deadlineDate.getTime() < today.getTime()) {
        alert('마감일은 오늘 또는 오늘 이후여야 합니다.');
        return;
      }
    }

    if (postType === CommunityPostType.STUDY) {
      if (!format) {
        alert('진행 방식은 필수입니다.');
        return;
      }
      if (!startDate) {
        alert('시작일은 필수입니다.');
        return;
      }
    }
    setIsSubmitting(true);
    try {
      let communityId: number;

      switch (postType) {
        case CommunityPostType.CONCERN: {
          const request: CreateConcernRequest = {title, content, tagNames: tags};
          communityId = await createConcern(userSignId, request);
          break;
        }
        case CommunityPostType.PROJECT: {
          // ✨ [수정] teamSize 처리 로직 (number | '' -> number | undefined)
          const finalTeamSize: number | undefined = teamSize === '' ? undefined : (teamSize as number);
          let formattedDeadline = '';
          if (deadline) {
            formattedDeadline = `${deadline}T23:59:59`; // YYYY-MM-DDT00:00:00 형식으로 변환
          } else {
            // 이 분기는 상위 유효성 검사에서 걸러졌어야 합니다.
            alert('마감일 데이터 전송 오류 (내부)');
            setIsSubmitting(false);
            return;
          }
          const baseRequest: CreateProjectRequest = {
            title,
            content,
            tagNames: tags,
            format: format as PostFormat,
            deadline : formattedDeadline,
            status: recruitmentStatus,
          };

          const request: CreateProjectRequest = {
            ...baseRequest,
            // finalTeamSize가 number일 때만 teamSize 필드를 추가하여 타입 에러를 해결합니다.
            ...(finalTeamSize !== undefined && { teamSize: finalTeamSize }),
          };

          communityId = await createProject(userSignId, request);
          break;
        }
        case CommunityPostType.STUDY: {

          const request: CreateStudyRequest = {
            title,
            content,
            status: recruitmentStatus,
            tagNames: tags,
            format: format as PostFormat,
            startDate,
            schedule: schedule || undefined, // schedule이 빈 문자열이면 undefined로 처리
          };
          communityId = await createStudy(userSignId, request);
          break;
        }
        default:
          throw new Error('Invalid post type');
      }
      alert('게시글이 작성되었습니다.');
      router.push(`/community/${postType.toLowerCase()}/${communityId}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>글쓰기</h1>
            <button
                onClick={() => router.back()}
                className={styles.backButton}
            >
              취소
            </button>
          </div>

          <div className={styles.form}>
            <div className={styles.typeSelector}>
              <label className={styles.label}>카테고리</label>
              <div className={styles.typeButtons}>
                <button
                    type="button"
                    onClick={() => setPostType(CommunityPostType.CONCERN)}
                    className={`${styles.typeButton} ${postType === CommunityPostType.CONCERN ? styles.typeButtonActive : ''} ${styles.typeConcern}`}
                >
                  고민있어요
                </button>
                <button
                    type="button"
                    onClick={() => setPostType(CommunityPostType.PROJECT)}
                    className={`${styles.typeButton} ${postType === CommunityPostType.PROJECT ? styles.typeButtonActive : ''} ${styles.typeProject}`}
                >
                  프로젝트
                </button>
                <button
                    type="button"
                    onClick={() => setPostType(CommunityPostType.STUDY)}
                    className={`${styles.typeButton} ${postType === CommunityPostType.STUDY ? styles.typeButtonActive : ''} ${styles.typeStudy}`}
                >
                  스터디
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>제목</label>
              <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className={styles.input}
                  maxLength={100}
              />
              <span className={styles.charCount}>{title.length}/100</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>내용</label>
              <SimpleTiptapEditor content={content} onChange={setContent}/>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>태그 (최대 5개)</label>
              <div className={styles.tagInputWrapper}>
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="태그를 입력하고 Enter를 누르세요"
                    className={styles.input}
                    maxLength={20}
                    disabled={tags.length >= 5}
                />
                <button
                    type="button"
                    onClick={handleTagAdd}
                    className={styles.tagAddButton}
                    disabled={tags.length >= 5}
                >
                  추가
                </button>
              </div>
              {tags.length > 0 && (
                  <div className={styles.tagList}>
                    {tags.map(tag => (
                        <div key={tag} className={styles.tag}>
                          <span>#{tag}</span>
                          <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className={styles.tagRemoveButton}
                          >
                            ×
                          </button>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            {/* ✨ PROJECT/STUDY 공통 필드 */}
            {(postType === CommunityPostType.PROJECT || postType === CommunityPostType.STUDY) && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>진행 방식 (필수)</label>
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as PostFormat | '')}
                        className={styles.input}
                    >
                      <option value="">선택</option>
                      <option value="ONLINE">온라인</option>
                      <option value="OFFLINE">오프라인</option>
                      <option value="HYBRID">온/오프라인 병행</option>
                    </select>
                  </div>

                {/*  <div className={styles.inputGroup}>
                    <label className={styles.label}>모집 상태 (필수)</label>
                    <select
                        value={recruitmentStatus}
                        onChange={(e) => setRecruitmentStatus(e.target.value as RecruitmentStatus)}
                        className={styles.input}
                    >
                      <option value="RECRUITING">모집중</option>
                      <option value="COMPLETED">모집 마감</option>
                    </select>
                  </div>*/}
                </>
            )}

            {/* PROJECT 전용 필드 */}
            {postType === CommunityPostType.PROJECT && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>모집 마감일</label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>모집 인원 (선택)</label>
                    <input
                        type="number"
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value) || '')}
                        placeholder="숫자만 입력 (예: 5)"
                        className={styles.input}
                        min="1"
                    />
                  </div>
                </>
            )}

            {/* STUDY 전용 필드 */}
            {postType === CommunityPostType.STUDY && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>시작일 (필수)</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>진행 요일/시간 (선택)</label>
                    <input
                        type="text"
                        value={schedule}
                        onChange={(e) => setSchedule(e.target.value)}
                        placeholder="예: 매주 화/목 저녁 7시"
                        className={styles.input}
                    />
                  </div>
                </>
            )}

            <div className={styles.actions}>
              <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={styles.submitButton}
              >
                {isSubmitting ? '작성 중...' : '작성 완료'}
              </button>
            </div>
          </div>
        </div>
      </Layout>
  );
}