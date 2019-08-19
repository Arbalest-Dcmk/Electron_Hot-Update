const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const { autoUpdater } = require("electron-updater")

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"
//autoUpdater.checkForUpdatesAndNotify()//自动更新

//ipcMain主进程与渲染进程通讯
ipcMain.on('render_sync',(event,arg)=>{//同步
  console.log(arg)
  event.returnValue="同步回复的消息"
})

ipcMain.on('render_async',(event,arg)=>{//异步
  console.log(arg)
  event.reply('render_async_reply',"异步回复的消息")
})

ipcMain.on('startUpdate',(event,arg)=>{//异步
  autoUpdater.checkForUpdates();
})

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载index.html文件
  win.loadURL(`file://${__dirname}/src/checkUpdate.html#v${app.getVersion()}`)

  // 打开开发者工具
  win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready',()=>{
  createWindow()
  
} )

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})


function sendStatusToWindow(text) {
  autoUpdater.logger.info(text);
  win.webContents.send('message', text);
}

//autoUpdater相关回调
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();  
// })


autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('正在检查更新...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('获取到更新。');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('未获取到更新.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('检查更新错误 ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "下载速度: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 已下载 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('更新下载完毕');
});