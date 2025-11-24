
import { ImageOptions } from '@tiptap/extension-image';

declare module '@tiptap/extension-image' {
  interface ImageOptions {
    // 이게 핵심!
    HTMLAttributes: {
      'data-width'?: number | null;
    };
  }
}