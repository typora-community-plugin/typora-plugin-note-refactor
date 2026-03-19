import { fs, I18n, openInputBox, path, Plugin } from '@typora-community-plugin/core'
import { editor, File, isInputComponent } from 'typora'


export default class extends Plugin {

  i18n = new I18n({
    resources: {
      'en': {
        extract: 'Extract selection to new note - first line as file name',
        extractRename: 'Extract selection to new note - manual rename it',
        placeholder: 'Input the new note\'s name',
      },
      'zh-cn': {
        extract: '提取选中内容到新笔记 - 第一行作为文件名',
        extractRename: '提取选中内容到新笔记 - 手动重命名',
        placeholder: '请输入笔记名称',
      },
    }
  })

  onload() {

    this.registerCommand({
      id: 'note-refactor:rename',
      title: this.i18n.t.extractRename,
      scope: 'editor',
      callback: () => this.extractSelection(true),
    })

    this.registerCommand({
      id: 'note-refactor',
      title: this.i18n.t.extract,
      scope: 'editor',
      callback: () => this.extractSelection(false),
    })
  }

  async extractSelection(useManualRename: boolean) {
    if (isInputComponent(document.activeElement)) return

    const range = editor.selection.getRangy()
    if (range.collapsed) return

    File.copy()
    const md = await navigator.clipboard.readText()

    let filename = useManualRename
      ? await openInputBox({
        placeholder: this.i18n.t.placeholder,
      }) ?? 'Untitled'
      : md.split('\n').at(0)!
        .replace(/[\\\/:*?"<>|\[\]#]/g, '')

    const notepath = path.join(path.dirname(this.app.workspace.activeFile), filename + '.md')

    fs.writeText(notepath, md)

    editor.UserOp.backspaceHandler(editor, null, 'Delete')
  }

}
