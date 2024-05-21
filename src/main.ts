import { fs, I18n, path, Plugin } from '@typora-community-plugin/core'
import { editor, File, isInputComponent } from 'typora'


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

  async extractSelection() {
    if (isInputComponent(document.activeElement)) return

    const range = editor.selection.getRangy()
    if (range.collapsed) return

    File.copy()
    const md = await navigator.clipboard.readText()

    const filename = md.split('\n').at(0)!
      .replace(/[\\\/:*?"<>|\[\]#]/g, '')
    const notepath = path.join(path.dirname(this.app.workspace.activeFile), filename + '.md')

    fs.writeText(notepath, md)

    editor.UserOp.backspaceHandler(editor, null, 'Delete')
  }

}
