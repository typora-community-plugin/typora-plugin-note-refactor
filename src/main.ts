import * as fs from 'fs'
import * as path from 'path'
import { I18n, Plugin } from '@typora-community-plugin/core'
import { ClientCommand, editor, isInputComponent } from 'typora'


export default class extends Plugin {

  i18n = new I18n({
    resources: {
      'en': { command: 'Extract selection to new note - first line as file name' },
      'zh-cn': { command: '提取选中内容到新笔记 - 第一行作为文件名' },
    }
  })

  onload() {

    this.registerCommand({
      id: 'note-refactor',
      title: this.i18n.t.command,
      scope: 'editor',
      callback: () => this.extractSelection(),
    })
  }

  onunload() {
  }

  async extractSelection() {
    if (isInputComponent(document.activeElement)) return

    const range = editor.selection.getRangy()
    if (range.collapsed) return

    ClientCommand.copyAsMarkdown()
    const md = await navigator.clipboard.readText()

    const filename = md.split('\n').at(0)!
      .replace(/[\\\/:*?"<>|\[\]#]/g, '')
    const notepath = path.join(path.dirname(this.app.workspace.activeFile), filename + '.md')

    fs.writeFileSync(notepath, md, 'utf8')

    editor.UserOp.backspaceHandler(editor, null, 'Delete')
  }

}
