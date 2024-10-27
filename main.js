const { app, BrowserWindow } = require("electron");

function createWin() {
  const win = new BrowserWindow({
    width: 1280,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenu(null);
  win.webContents.openDevTools();
  win.loadFile("index.html");
}

app.on("ready", () => createWin());
