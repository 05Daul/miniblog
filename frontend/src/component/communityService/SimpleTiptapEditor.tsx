// src/component/community/SimpleTiptapEditor.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Editor } from '@tiptap/core';
import styles from '@/styles/community/SimpleTiptapEditor.module.css';
import { uploadImage } from '@/api/blogService/blog';

type ImageAlignment = 'left' | 'center' | 'right';

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      'data-align': {
        default: 'center' as ImageAlignment,
        parseHTML: (element) => (element.getAttribute('data-align') as ImageAlignment) || 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes['data-align'] }),
      },
      'data-width': {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('data-width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes['data-width']) return {};
          const align = (attributes['data-align'] as ImageAlignment) || 'center';
          let marginStyle = '';
          if (align === 'left') marginStyle = 'margin-left: 0; margin-right: auto;';
          else if (align === 'right') marginStyle = 'margin-left: auto; margin-right: 0;';
          else marginStyle = 'margin-left: auto; margin-right: auto;';

          return {
            'data-width': attributes['data-width'],
            'data-align': align,
            style: `width: ${attributes['data-width']}px; max-width: 100%; height: auto; display: block; ${marginStyle}`,
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
      img.dataset.align = attrs['data-align'] || 'center';

      const currentAlign = attrs['data-align'] || 'center';
      let marginStyle = '';
      if (currentAlign === 'left') marginStyle = 'margin-left: 0; margin-right: auto;';
      else if (currentAlign === 'right') marginStyle = 'margin-left: auto; margin-right: 0;';
      else marginStyle = 'margin-left: auto; margin-right: auto;';

      img.style.cssText = `
        max-width: 100%;
        height: auto;
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 8px;
        transition: border-color 0.2s;
        display: block;
        ${attrs['data-width'] ? `width: ${attrs['data-width']}px;` : 'width: 100%;'}
        ${marginStyle}
      `;

      img.onmouseover = () => (img.style.borderColor = '#6366F1');
      img.onmouseout = () => (img.style.borderColor = 'transparent');

      img.onclick = (e) => {
        e.stopPropagation();
        if (typeof getPos === 'function') {
          document.dispatchEvent(
              new CustomEvent('simple-tiptap-image-resize', {
                detail: {
                  src: attrs.src,
                  currentWidth: attrs['data-width'] || 600,
                  pos: getPos(),
                  currentAlign: attrs['data-align'] || 'center',
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
          if (newAttrs['data-width'] !== undefined) {
            img.dataset.width = newAttrs['data-width']?.toString() || '';
            img.style.width = newAttrs['data-width'] ? `${newAttrs['data-width']}px` : '100%';
          }
          if (newAttrs['data-align'] !== img.dataset.align) {
            const newAlign = newAttrs['data-align'] || 'center';
            img.dataset.align = newAlign;
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

const MenuBar = ({ editor, addImage }: { editor: Editor | null; addImage: () => void }) => {
  if (!editor) return null;

  return (
      <div className={styles.menuBar}>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}
            title="제목 1"
        >
          H1
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}
            title="제목 2"
        >
          H2
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? styles.isActive : ''}
            title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? styles.isActive : ''}
            title="글머리 기호 목록"
        >
          •
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? styles.isActive : ''}
            title="번호 목록"
        >
          1.
        </button>
        <button
            type="button"
            onClick={addImage}
            title="이미지 추가"
        >
          🖼️
        </button>
      </div>
  );
};

interface SimpleTiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const SimpleTiptapEditor: React.FC<SimpleTiptapEditorProps> = ({ content, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageWidth, setImageWidth] = useState(600);
  const [imageAlign, setImageAlign] = useState<ImageAlignment>('center');
  const [targetPos, setTargetPos] = useState<number | null>(null);
  const [targetSrc, setTargetSrc] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { style: 'white-space: pre-wrap;' } },
      }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ src: string; currentWidth: number; pos: number; currentAlign?: ImageAlignment }>;
      setTargetSrc(ev.detail.src);
      setImageWidth(ev.detail.currentWidth);
      setTargetPos(ev.detail.pos);
      setImageAlign(ev.detail.currentAlign || 'center');
      setModalOpen(true);
    };

    document.addEventListener('simple-tiptap-image-resize', handler);
    return () => document.removeEventListener('simple-tiptap-image-resize', handler);
  }, []);

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
          'data-align': 'center',
        } as any).run();
      } catch (err) {
        console.error(err);
        alert('이미지 업로드 실패');
      }
    };
    input.click();
  }, [editor]);

  const applyResize = () => {
    if (!editor || targetPos === null) return;
    const tr = editor.state.tr;
    const currentAttrs = editor.getAttributes('image');
    tr.setNodeMarkup(targetPos, undefined, {
      ...currentAttrs,
      'data-width': imageWidth,
      'data-align': imageAlign,
    });
    editor.view.dispatch(tr);
    setModalOpen(false);
  };

  if (!editor) return null;

  return (
      <div className={styles.editorWrapper}>
        <MenuBar editor={editor} addImage={addImage} />
        <EditorContent editor={editor} className={styles.editorContent} />

        {modalOpen && (
            <div className={styles.modal} onClick={() => setModalOpen(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3>이미지 설정</h3>

                <div className={styles.previewContainer}>
                  <img
                      src={targetSrc}
                      alt="preview"
                      style={{
                        width: `${imageWidth}px`,
                        maxWidth: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        marginLeft: imageAlign === 'left' ? '0' : 'auto',
                        marginRight: imageAlign === 'right' ? '0' : 'auto',
                      }}
                  />
                </div>

                <div className={styles.control}>
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

                <div className={styles.control}>
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
                      중앙
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

export default SimpleTiptapEditor;