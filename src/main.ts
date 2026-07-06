import * as Locale from './locales/lang.en.json'
import { fs, I18n, openInputBox, path, Plugin } from '@typora-community-plugin/core'
import { editor, File, isInputComponent } from 'typora'


export default class extends Plugin {

  i18n = new I18n<typeof Locale>({
    localePath: path.join(this.manifest.dir!, 'locales')
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
