// src/component/extensions/PreserveWhitespace.ts

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const PreserveWhitespace = Extension.create({
  name: 'preserveWhitespace',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('preserveWhitespace'),
        props: {
          // ✅ DOM을 파싱할 때 공백 보존
          transformPastedHTML(html) {
            // 연속된 공백을 &nbsp;로 변환
            return html.replace(/ {2,}/g, (match) => {
              return '&nbsp;'.repeat(match.length)
            })
          },
        },
      }),
    ]
  },

  // ✅ 저장 시 공백을 &nbsp;로 변환
  addStorage() {
    return {
      preserveSpaces: true,
    }
  },
})