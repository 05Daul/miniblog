// src/component/TiptapEditor.tsx
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import styles from '../styles/TiptapEditor.module.css'

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

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

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
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.isActive : ''}
        >
          B
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? styles.isActive : ''}
        >
          I
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? styles.isActive : ''}
        >
          S
        </button>

        <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.isActive : ''}
        >
          • List
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.isActive : ''}
        >
          1. List
        </button>

        <button
            type="button"
            onClick={() => document.getElementById('image-input')?.click()}>
          🖼 이미지
        </button>
        <input
            id="image-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e: any) => {
              const file = e.target.files?.[0]
              if (!file) return

              const formData = new FormData()
              formData.append("file", file)

              try {
                const res = await fetch('/api/upload', {
                  method: "POST",
                  body: formData,
                })
                if(res.ok) {
                  const { url } = await res.json()
                  editor.chain().focus().setImage({ src: url }).run()
                }
              } catch (err) {
                console.error("이미지 업로드 실패", err)
              }
            }}
        />

        <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? styles.isActive : ''}
        >
          {'</>'} Code
        </button>
      </div>
  )
}

interface TiptapProps {
  content?: string
  onChange?: (html: string) => void
}

const TiptapEditor = ({ content = '', onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // ✅ paragraph에서 연속 줄바꿈을 위해 preserveWhitespace 설정
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
      onChange?.(preservedHtml)
    },
    // ✅ 에디터 전체 속성 설정
    editorProps: {
      attributes: {
        style: 'white-space: pre-wrap;', // 공백 보존
      },
    },
    // ✅ 공백 보존 설정
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

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
                __html: (editor?.getHTML() || '')
                // ✅ 빈 p 태그에 공백 문자 추가
                .replace(/<p><\/p>/g, '<p>&nbsp;</p>')
                .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
              }}
          />
        </div>
      </div>
  )
}

export default TiptapEditor