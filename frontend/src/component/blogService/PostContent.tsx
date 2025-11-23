// src/component/blogService/PostContent.tsx

'use client';

import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface PostContentProps {
  content: string;
}

// 제목 태그에 ID를 자동으로 부여하는 함수
function assignIdsToHeadings(contentHtml: string): string {
  let sectionIndex = 1;
  return contentHtml.replace(/<h([1-3])(.*?)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    const slug = text.trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const id = `section-${sectionIndex++}-${slug}`;
    return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
  });
}

export default function PostContent({ content }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentWithIds = assignIdsToHeadings(content);
      contentRef.current.innerHTML = contentWithIds;

      // 코드 하이라이팅 적용
      contentRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  return (
      <div
          ref={contentRef}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap', // ✅ 공백과 줄바꿈 보존
            lineHeight: '1.5' // ✅ 줄 높이 명시
          }}
          className="prose prose-lg max-w-none leading-relaxed
                 prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-lg
                 prose-code:text-sm prose-code:font-mono
                 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                 prose-p:whitespace-pre-wrap prose-p:min-h-[1.5em] prose-p:leading-[1.5]"
      />
  );
}