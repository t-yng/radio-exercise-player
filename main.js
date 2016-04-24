'use strict'

const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const Tray = electron.Tray
const BrowserWindow = require('browser-window')
const CronJob = require('cron').CronJob


function startCronJob() {
  new CronJob('54 24 9 * * *', openWindow, null, true)  
}

function openWindow() {  
  let mainWindow = null

  mainWindow = new BrowserWindow({ width: 800, height: 600, 'node-integration': false, 'always-on-top': true})
  mainWindow.loadURL('file://'+ __dirname + '/index.html')
  // Window起動時に全画面表示を実現するために、herokuにアップした全画面でyoutubeの動画を再生するページを読み込む
  // mainWindow.loadURL('https://floating-refuge-79069.herokuapp.com/')
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
  // mainWindow.openDevTools()
  
  setTimeout(() => {mainWindow.close()}, 202000)

  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

app.on('ready', () => {
  let trayIcon = new Tray(__dirname + '/icon/radio.png')
  trayIcon.setHighlightMode(true)
  startCronJob()
})

app.on('window-all-closed', function(){
  // darwin(Mac OS X)以外ならアプリを終了する
  if(process.platform != 'darwin'){
    app.quit()
  }
  else{
    app.quit()
  }
})
