import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs, existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 本地数据文件路径：C:\Users\<user>\AppData\Roaming\<appName>\usy-data.json
const shujuWenjianLujing = join(app.getPath('userData'), 'usy-data.json')

// 默认初始项目数据（首次运行没有本地文件时初始化为空列表）
const chushiXiangmuShuju = []

// 注册系统底层 IPC 处理函数（遵循 ltb-backend-style 规范）
function zhuceXitongIpc() {
  // 1. 调用 Windows 原生文件夹选择窗口
  ipcMain.handle('dialog:selectFolder', async () => {
    console.log('+++++++', '主进程接收到原生文件夹选择请求')
    const jieguo = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: '选择本地实训项目所在文件夹'
    })

    if (jieguo.canceled || !jieguo.filePaths.length) {
      console.log('+++++++', '用户取消了文件夹选择')
      return ''
    }

    const xuanzhongLujing = jieguo.filePaths[0]
    console.log('+++++++', '用户选中文件夹路径：', xuanzhongLujing)
    return xuanzhongLujing
  })

  // 2. 唤起 Windows 资源管理器打开指定目录
  ipcMain.handle('shell:openFolder', async (_, mubiaoLujing) => {
    console.log('*-*-*-*', '主进程接收到唤起文件夹请求：', mubiaoLujing)
    if (!mubiaoLujing || mubiaoLujing === '待关联本地文件夹') {
      return { success: false, message: '尚未关联有效的本地项目文件夹路径！' }
    }

    try {
      const cuowuXinxi = await shell.openPath(mubiaoLujing)
      if (cuowuXinxi) {
        console.log('*-*-*-*', '唤起文件夹失败：', cuowuXinxi)
        return { success: false, message: cuowuXinxi }
      }
      console.log('*-*-*-*', '已成功在 Windows 资源管理器中打开：', mubiaoLujing)
      return { success: true }
    } catch (err) {
      console.log('*-*-*-*', '打开文件夹发生异常：', err)
      return { success: false, message: err.message }
    }
  })

  // 3. 从本地磁盘读取项目与任务 JSON 数据
  ipcMain.handle('data:load', async () => {
    console.log('-------', '主进程读取本地数据文件：', shujuWenjianLujing)
    try {
      // 若本地文件不存在，自动创建并写入初始预置数据
      if (!existsSync(shujuWenjianLujing)) {
        console.log('-------', '本地数据文件尚不存在，创建并写入初始数据')
        const chushiJson = JSON.stringify(chushiXiangmuShuju, null, 2)
        await fs.writeFile(shujuWenjianLujing, chushiJson, 'utf-8')
        return chushiXiangmuShuju
      }

      // 读取并解析已有数据
      const wenjianNgr = await fs.readFile(shujuWenjianLujing, 'utf-8')
      const jiexiShuju = JSON.parse(wenjianNgr)
      console.log('-------', '成功读取本地数据，项目条数：', jiexiShuju.length)
      return jiexiShuju
    } catch (err) {
      console.log('-------', '读取本地数据发生异常，降级返回初始数据：', err)
      return chushiXiangmuShuju
    }
  })

  // 4. 将最新项目与任务数据安全保存到本地磁盘
  ipcMain.handle('data:save', async (_, xiangmuLiebiao) => {
    console.log('=======', '主进程开始保存数据到本地文件：', shujuWenjianLujing)
    try {
      const shujuWb = JSON.stringify(xiangmuLiebiao, null, 2)
      await fs.writeFile(shujuWenjianLujing, shujuWb, 'utf-8')
      console.log('=======', '本地数据保存成功，项目总数：', xiangmuLiebiao?.length)
      return { success: true }
    } catch (err) {
      console.log('=======', '本地数据保存失败：', err)
      return { success: false, message: err.message }
    }
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册主进程与系统底层 IPC 通信处理器
  zhuceXitongIpc()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
