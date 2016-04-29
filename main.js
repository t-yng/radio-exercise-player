'use strict'

const electron = require('electron')
const storage = require('electron-json-storage')
const app = electron.app
const ipcMain = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray
const BrowserWindow = require('browser-window')
const CronJob = require('cron').CronJob
const DEBUG = false;

let trayIcon = null
let cronJob = null

app.on('ready', init)

app.on('window-all-closed', function(){
  // darwin(Mac OS X)以外ならアプリを終了する
  if(process.platform != 'darwin'){
    app.quit()
  }
})

function startCronJob(hours, minutes, seconds) {
  cronJob = new CronJob(`${seconds} ${minutes} ${hours} * * *`, openMainWindow, null, true)
}

function openMainWindow() {  
  let mainWindow = null

  mainWindow = new BrowserWindow({ width: 800, height: 600, 'node-integration': false, 'always-on-top': true})
  // mainWindow.loadURL('file://'+ __dirname + '/index.html')
  // Window起動時に全画面表示を実現するために、herokuにアップした全画面でyoutubeの動画を再生するページを読み込む
  mainWindow.loadURL('https://floating-refuge-79069.herokuapp.com/')
  mainWindow.setFullScreen(true)

  if(mainWindow.isFullScreen) {
    console.log('fullscreen')
  }
  else{
    console.log('not fullscreen')
  }
  
  while(!mainWindow.isFullScreen()) {
    console.log('not fullscreen')
    mainWindow.setFullScreen(true)
  }
  
  // ディベロッパーツールを表示
  if(DEBUG) mainWindow.openDevTools()
  
  setTimeout(() => {mainWindow.close()}, 202000)

  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

// アプリの初期化
function init() {
  trayIcon = new Tray(__dirname + '/icon/radio.png')

  // トレイアイコンを設定
  var time = '09:25:00'
  storage.get('config', (error, data) => {
    if(error) throw error
    
    if(Object.keys(data).length != 0){
      time = data.time
      
      let contextMenu = Menu.buildFromTemplate([
        { label: `起動時間 : ${time}`, enabled: false },
        { type: 'separator' },
        { label: '時間設定', click: openSettingWindow },   
        { label: '終了', click: app.quit}
      ])  
      trayIcon.setHighlightMode(true)
      trayIcon.setContextMenu(contextMenu)
      
      let times = time.split(":")
      
      // 動画を再生する時間を設定
      startCronJob(times[0], times[1], times[2])  
    }    
  })
}

function reStart() {
  trayIcon.destroy()
  if(cronJob != null) cronJob.stop()
  init()  
}

function openSettingWindow() {
  let settingWindow = new BrowserWindow({width:400, height:200})
  settingWindow.loadURL('file://'+ __dirname + '/html/timer-setting.html')

  if(DEBUG) settingWindow.openDevTools()
  
  settingWindow.on('closed', function() {
    settingWindow = null
  })
}

// 起動時刻の設定画面から設定時間を受信する
ipcMain.on('setting-start-time', (event, arg) => {
  var config = {
    time: arg
  }

  storage.set('config', config, (error) => {
    if(error) throw error
  })
  
  reStart()
})

// 設定時間を返す
ipcMain.on('get-start-time', (event, arg) => {
  storage.get('config', (error, data) => {
    if(error) throw error
    
    if(Object.keys(data).length != 0){
      event.sender.send('get-start-time-reply', data.time)
    }
  })  
})