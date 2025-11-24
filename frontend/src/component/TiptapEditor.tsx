import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Editor } from '@tiptap/core';
import styles from '../styles/TiptapEditor.module.css';
import { uploadImage } from '@/api/blogService/blog';

// 타입 정의 (편의상 추가)
type ImageAlignment = 'left' | 'center' | 'right';

/* ==================== ResizableImage (핵심: data-width, data-align 사용) ==================== */
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },

      // ✅ 1. data-align 속성 추가
      'data-align': {
        default: 'center' as ImageAlignment,
        parseHTML: (element) => (element.getAttribute('data-align') as ImageAlignment) || 'center',
        renderHTML: (attributes) => {
          return {
            'data-align': attributes['data-align'],
          };
        },
      },

      // data-width로 저장 → Tiptap이 완벽하게 보존함
      'data-width': {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('data-width');
          return width ? parseInt(width, 10) : null;
        },
        // ✅ 2. renderHTML에서 data-align 기반으로 margin 인라인 스타일 추가
        renderHTML: (attributes) => {
          if (!attributes['data-width']) return {};

          const align = (attributes['data-align'] as ImageAlignment) || 'center';
          let marginStyle = '';

          // 정렬 값에 따른 margin 스타일 정의
          if (align === 'left') {
            marginStyle = 'margin-left: 0; margin-right: auto;';
          } else if (align === 'right') {
            marginStyle = 'margin-left: auto; margin-right: 0;';
          } else { // center
            marginStyle = 'margin-left: auto; margin-right: auto;';
          }

          return {
            'data-width': attributes['data-width'],
            'data-align': align,
            style: `
              width: ${attributes['data-width']}px; 
              max-width: 100%; 
              height: auto; 
              display: block;
              ${marginStyle} /* ✅ 정렬 스타일 추가 */
            `,
          };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, getPos }) => {
      const img = document.createElement('img');
      const attrs = node.attrs as { src: string; 'data-width'?: number | null; alt?: string; 'data-align'?: ImageAlignment };

      img.src = attrs.src;
      img.alt = attrs.alt || '';
      img.dataset.width = attrs['data-width']?.toString() || '';
      img.dataset.align = attrs['data-align'] || 'center'; // data-align 설정

      // 정렬 스타일을 계산하는 함수 (NodeView의 update 로직에서 재사용)
      const updateMarginStyle = (align: ImageAlignment) => {
        if (align === 'left') {
          return 'margin-left: 0; margin-right: auto;';
        } else if (align === 'right') {
          return 'margin-left: auto; margin-right: 0;';
        } else {
          return 'margin-left: auto; margin-right: auto;';
        }
      }

      const currentAlign = attrs['data-align'] || 'center';
      const marginStyle = updateMarginStyle(currentAlign);


      img.style.cssText = `
        max-width: 100%;
        height: auto;
        cursor: pointer;
        border: 3px solid transparent;
        border-radius: 8px;
        transition: border-color 0.2s;
        display: block;
        ${attrs['data-width'] ? `width: ${attrs['data-width']}px;` : 'width: 100%;'}
        ${marginStyle} /* ✅ NodeView 정렬 스타일 추가 */
      `;

      img.onmouseover = () => (img.style.borderColor = '#6366F1');
      img.onmouseout = () => (img.style.borderColor = 'transparent');

      img.onclick = (e) => {
        e.stopPropagation();
        if (typeof getPos === 'function') {
          document.dispatchEvent(
              new CustomEvent('tiptap-image-resize-request', {
                detail: {
                  src: attrs.src,
                  currentWidth: attrs['data-width'] || 600,
                  pos: getPos(),
                  currentAlign: attrs['data-align'] || 'center', // ✅ 현재 정렬값 추가
                },
              })
          );
        }
      };

      return {
        dom: img,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          const newAttrs = updatedNode.attrs as typeof attrs;

          if (newAttrs.src !== img.src) img.src = newAttrs.src;

          // data-width 업데이트
          if (newAttrs['data-width'] !== undefined) {
            img.dataset.width = newAttrs['data-width']?.toString() || '';
            img.style.width = newAttrs['data-width'] ? `${newAttrs['data-width']}px` : '100%';
          }

          // ✅ data-align 업데이트 (NodeView 정렬 반영)
          if (newAttrs['data-align'] !== img.dataset.align) {
            const newAlign = newAttrs['data-align'] || 'center';
            img.dataset.align = newAlign;
            // NodeView 스타일 직접 업데이트
            if (newAlign === 'left') {
              img.style.marginLeft = '0';
              img.style.marginRight = 'auto';
            } else if (newAlign === 'right') {
              img.style.marginLeft = 'auto';
              img.style.marginRight = '0';
            } else {
              img.style.marginLeft = 'auto';
              img.style.marginRight = 'auto';
            }
          }
          return true;
        },
      };
    };
  },
});

/* ==================== 공백 보존 함수 ==================== */
function preserveSpacesInHTML(html: string): string {
  return html
  .replace(/<p><\/p>/g, '<p>&nbsp;</p>')
  .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
  .replace(/(<p[^>]*>)(\s+)/g, (match, tag, spaces) => tag + '&nbsp;'.repeat(spaces.length))
  .replace(/(\s{2,})/g, (m) => '&nbsp;'.repeat(m.length));
}

/* ==================== MenuBar ==================== */
const MenuBar = ({ editor, addImage }: { editor: Editor | null; addImage: () => void }) => {
  if (!editor) return null;

  return (
      <div className={styles.menuBar}>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}>
          H1
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.isActive : ''}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.isActive : ''}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.isActive : ''}>
          List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.isActive : ''}>
          Ordered List
        </button>
        <button type="button" onClick={addImage}>
          Image
        </button>
      </div>
  );
};

/* ==================== 메인 컴포넌트 ==================== */
interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageWidth, setImageWidth] = useState(600);
  // ✅ 추가: 이미지 정렬 상태
  const [imageAlign, setImageAlign] = useState<ImageAlignment>('center');
  const [targetPos, setTargetPos] = useState<number | null>(null);
  const [targetSrc, setTargetSrc] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { style: 'white-space: pre-wrap;' } },
        hardBreak: { keepMarks: false },
      }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
    ],
    content,
    immediatelyRender: false,
    editorProps: { attributes: { style: 'white-space: pre-wrap;' } },
    parseOptions: { preserveWhitespace: 'full' },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(preserveSpacesInHTML(html));
    },
  });

  // 외부 content 변경 시 동기화
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // 이미지 리사이징/정렬 요청 수신
  useEffect(() => {
    const handler = (e: Event) => {
      // CustomEvent detail 타입 업데이트
      const ev = e as CustomEvent<{ src: string; currentWidth: number; pos: number; currentAlign?: ImageAlignment }>;
      setTargetSrc(ev.detail.src);
      setImageWidth(ev.detail.currentWidth);
      setTargetPos(ev.detail.pos);
      setImageAlign(ev.detail.currentAlign || 'center'); // ✅ 정렬 상태 업데이트
      setModalOpen(true);
    };

    document.addEventListener('tiptap-image-resize-request', handler);
    return () => document.removeEventListener('tiptap-image-resize-request', handler);
  }, []);

  // 이미지 업로드
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      try {
        const result = await uploadImage(file);
        const url = (result as any).url || result;
        editor.chain().focus().setImage({
          src: url,
          'data-width': 600,
          'data-align': 'center', // ✅ 업로드 시 기본 정렬 설정
        } as any).run();
      } catch (err) {
        console.error(err);
        alert('이미지 업로드 실패');
      }
    };
    input.click();
  }, [editor]);

  // 리사이징 및 정렬 적용 (data-width, data-align로 저장!)
  const applyResize = () => {
    if (!editor || targetPos === null) return;
    const tr = editor.state.tr;
    const currentAttrs = editor.getAttributes('image');
    tr.setNodeMarkup(targetPos, undefined, {
      ...currentAttrs,
      'data-width': imageWidth,
      'data-align': imageAlign, // ✅ 정렬 속성 추가
    });
    editor.view.dispatch(tr); // 변경 적용
    setModalOpen(false);
  };

  if (!editor) return null;

  return (
      <div className={styles.editorWrapper}>
        <div className={styles.editorPane}>
          <MenuBar editor={editor} addImage={addImage} />
          <EditorContent editor={editor} className={styles.editorContent} />
        </div>

        <div className={styles.previewPane}>
          <h3 className={styles.previewTitle}>미리보기</h3>
          <div
              className={styles.previewContent}
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: preserveSpacesInHTML(editor.getHTML()) }}
          />
        </div>

        {/* 이미지 리사이징/정렬 모달 */}
        {modalOpen && (
            <div className={styles.imageResizeModal} onClick={() => setModalOpen(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>이미지 크기 조정 및 정렬</h3>

                <div className={styles.previewContainer}>
                  <img
                      src={targetSrc}
                      alt="preview"
                      style={{
                        width: `${imageWidth}px`,
                        maxWidth: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        // ✅ 모달 미리보기에도 정렬 반영
                        marginLeft: imageAlign === 'left' ? '0' : 'auto',
                        marginRight: imageAlign === 'right' ? '0' : 'auto',
                      }}
                  />
                </div>

                <div className={styles.resizeControl}>
                  <label>너비: {imageWidth}px</label>
                  <input
                      type="range"
                      min="200"
                      max="1200"
                      step="10"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                  />
                </div>

                {/* ✅ 정렬 컨트롤 추가 */}
                <div className={styles.alignControl}>
                  <label>정렬:</label>
                  <div className={styles.alignButtons}>
                    <button
                        type="button"
                        onClick={() => setImageAlign('left')}
                        className={imageAlign === 'left' ? styles.alignActive : ''}
                    >
                      좌
                    </button>
                    <button
                        type="button"
                        onClick={() => setImageAlign('center')}
                        className={imageAlign === 'center' ? styles.alignActive : ''}
                    >
                      가운데
                    </button>
                    <button
                        type="button"
                        onClick={() => setImageAlign('right')}
                        className={imageAlign === 'right' ? styles.alignActive : ''}
                    >
                      우
                    </button>
                  </div>
                </div>


                <div className={styles.modalButtons}>
                  <button onClick={() => setModalOpen(false)} className={styles.cancelBtn}>
                    취소
                  </button>
                  <button onClick={applyResize} className={styles.applyBtn}>
                    적용
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default TiptapEditor;