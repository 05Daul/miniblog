// src/component/blogService/TableOfContents.tsx (새 파일)

'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/blogService/postDetail.module.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // 💡 [수정] PostContent가 렌더링한 실제 DOM에서 제목 태그를 스캔하여 목차를 만듭니다.
  useEffect(() => {
    const scanHeadings = () => {
      const scannedItems: TocItem[] = [];
      // article.mainContent 내부의 H1, H2, H3 태그 중 ID가 있는 것을 찾습니다.
      document.querySelectorAll('article h1[id], article h2[id], article h3[id]').forEach((heading) => {
        const id = heading.getAttribute('id');
        const text = heading.textContent;
        const level = parseInt(heading.tagName[1], 10);

        if (id && text && text.trim().length > 0) {
          scannedItems.push({ id, text: text.trim(), level });
        }
      });
      setTocItems(scannedItems);
    };

    // DOM이 완전히 업데이트된 후 스캔하도록 보장 (PostContent의 innerHTML 적용 후)
    const timeoutId = setTimeout(scanHeadings, 100);

    return () => clearTimeout(timeoutId);
  }, [content]);


  // 🖱️ 스크롤 이동 로직: 클릭 시 부드럽게 이동
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };


  // 목차가 없으면 null 반환 (PostDetail.tsx에서 이미 조건부 렌더링 했지만 안전 장치)
  if (tocItems.length === 0) {
    return null;
  }

  return (
      <nav className={styles.tocNav}>
        {/* 💡 요청에 따라 목차 제목 태그 추가 */}
        <h4 className={styles.tocTitle}>목차</h4>
        <ul className={styles.tocList}>
          {tocItems.map((item, index) => (
              <li
                  key={index}
                  // CSS 모듈에 정의된 레벨별 들여쓰기 클래스 사용 (예: tocLevel2, tocLevel3)
                  className={styles[`tocLevel${item.level}`]}
              >
                <a
                    href={`#${item.id}`}
                    className={styles.tocLink}
                    onClick={(e) => handleScrollTo(e, item.id)}
                >
                  {item.text}
                </a>
              </li>
          ))}
        </ul>
      </nav>
  );
}