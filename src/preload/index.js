import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// Custom APIs for renderer
const api = {
  // 1.调用windows原生文件夹选择窗口
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  // 2.唤起windows资源管理器打开指定本地目录
  openFolder: (mubiaoLujing) => ipcRenderer.invoke('shell:openFolder', mubiaoLujing),
  // 3. 读取本地持久化JSon数据
  loadData: () => ipcRenderer.invoke('data:load'),
  // 4. 将最新项目与任务数据安全保存到本地磁盘
  saveData: (xiangmuLiebiao) => ipcRenderer.invoke('data:save', xiangmuLiebiao)
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
