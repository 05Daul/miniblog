import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Editor } from '@tiptap/core'; // ✅ Tiptap 에디터 타입 import
import styles from '../styles/TiptapEditor.module.css';
import { uploadImage } from '@/api/blogService/blog'; // ✅ API 함수 import


// Props 타입 정의
interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// ✅ 공백 보존 처리 함수
function preserveSpacesInHTML(html: string): string {
  return html
  // 빈 p 태그를 &nbsp;가 있는 p 태그로 변환
  .replace(/<p><\/p>/g, '<p>&nbsp;</p>')
  .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
  // 문장 시작 공백을 &nbsp;로 변환
  .replace(/(<p[^>]*>)(\s+)/g, (match, tag, spaces) => {
    return tag + '&nbsp;'.repeat(spaces.length)
  })
  // 연속된 2개 이상의 공백을 &nbsp;로 변환
  .replace(/(\s{2,})/g, (match) => {
    return '&nbsp;'.repeat(match.length)
  })
}

// ----------------------------------------------------------------------
// MenuBar 컴포넌트
// ----------------------------------------------------------------------

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  // 이미지 업로드 핸들러
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        try {
          // 파일 업로드 API 호출
          const result = await uploadImage(file);
          const url = result.url; // API 응답 구조에 맞게 유지

          if (url) {
            // 업로드 성공 시 에디터에 이미지 삽입
            editor.chain().focus().setImage({ src: url }).run();
          }
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          alert("이미지 업로드에 실패했습니다.");
        }
      }
    };
    input.click();
  }, [editor]);

  return (
      <div className={styles.menuBar}>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}
        >
          H1
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}
        >
          H2
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? styles.isActive : ''}
        >
          H3
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.isActive : ''}
        >
          Bold
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.isActive : ''}
        >
          Italic
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? styles.isActive : ''}
        >
          Strike
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? styles.isActive : ''}
        >
          Code
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.isActive : ''}
        >
          List
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.isActive : ''}
        >
          Ordered List
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? styles.isActive : ''}
        >
          Quote
        </button>
        <button
            type="button"
            onClick={addImage}
            className={editor.isActive('image') ? styles.isActive : ''}
        >
          Image
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? styles.isActive : ''}
        >
          Code Block
        </button>
      </div>
  )
}

// ----------------------------------------------------------------------
// TiptapEditor 컴포넌트
// ----------------------------------------------------------------------

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // ✅ whiteSpace 설정
        paragraph: {
          HTMLAttributes: {
            style: 'white-space: pre-wrap;',
          },
        },
        // ✅ hardBreak 활성화 - Enter로 줄바꿈 (기본 동작)
        hardBreak: {
          keepMarks: false,
        },
      }),
      Image,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // ✅ HTML 출력 시 공백을 보존하도록 처리
      const html = editor.getHTML()
      const preservedHtml = preserveSpacesInHTML(html)
      onChange(preservedHtml)

      // ❌ 썸네일 추출 로직 제거 (이제 WritePage.tsx에서 전용 업로드로 처리)
    },
    editorProps: {
      attributes: {
        style: 'white-space: pre-wrap;', // 공백 보존
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  // 초기 content 설정 (props 변경 시 내부 에디터 업데이트)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });    }
  }, [editor, content]);

  // ❌ 초기 로드 시 썸네일 URL 설정 로직 제거

  return (
      <div className={styles.editorWrapper}>
        <div className={styles.editorPane}>
          <MenuBar editor={editor} />
          <EditorContent editor={editor} className={styles.editorContent} />
        </div>

        <div className={styles.previewPane}>
          <h3 className={styles.previewTitle}>미리보기</h3>
          <div
              className={styles.previewContent}
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{
                // ✅ 널 체크
                __html: (editor?.getHTML() || '')
                .replace(/<p><\/p>/g, '<p>&nbsp;</p>') // 빈 p 태그에 공백 문자 추가
              }}
          />
        </div>
      </div>
  )
}

export default TiptapEditor;