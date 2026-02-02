export type Language = 'zh-CN' | 'en-US'
export type Translation = {
  app: {
    title: string
    version: string
  }
  menu: {
    file: string
    edit: string
    paragraph: string
    format: string
    view: string
    help: string
    new: string
    open: string
    save: string
    exportPDF: string
    exportHTML: string
    exportWord: string
    undo: string
    redo: string
    cut: string
    copy: string
    paste: string
    selectAll: string
    heading1: string
    heading2: string
    heading3: string
    heading4: string
    heading5: string
    heading6: string
    plainText: string
    codeBlock: string
    quoteBlock: string
    bulletList: string
    orderedList: string
    taskList: string
    bold: string
    italic: string
    strike: string
    code: string
    link: string
    image: string
    table: string
    toggleSidebar: string
    about: string
  }
  toolbar: {
    new: string
    open: string
    save: string
    export: string
    pdf: string
    html: string
    word: string
    settings: string
  }
  statusbar: {
    characters: string
    lines: string
    language: string
    encoding: string
    theme: string
  }
  sidebar: {
    outline: string
    noOutline: string
    addHeadings: string
    show: string
    hide: string
  }
  editor: {
    placeholder: string
    empty: string
  }
  settings: {
    title: string
    general: string
    appearance: string
    language: string
    theme: string
    themeLight: string
    themeDark: string
    themeSystem: string
    export: string
    pandocPath: string
    pandocPathHint: string
    pandocDownload: string
    pandocDownloadLink: string
    browse: string
    save: string
    cancel: string
  }
  dialog: {
    unsavedChanges: string
    saveFailed: string
    exportSuccess: string
    exportFailed: string
    pandocNotFound: string
    pandocRequired: string
  }
  status: {
    modified: string
    saved: string
    unsaved: string
  }
}
