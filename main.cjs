const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;
let photoDirectory;

function defaultPhotoDirectory() {
  return path.join(app.getPath('pictures'), 'Photobooth');
}

async function ensurePhotoDirectory() {
  photoDirectory ||= defaultPhotoDirectory();
  await fs.mkdir(photoDirectory, { recursive: true });
  return photoDirectory;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: '#15111d',
    title: 'Photobooth Camo',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
  await ensurePhotoDirectory();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('photo:get-directory', async () => ensurePhotoDirectory());

ipcMain.handle('photo:choose-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choisir le dossier des photos',
    defaultPath: await ensurePhotoDirectory(),
    properties: ['openDirectory', 'createDirectory']
  });
  if (!result.canceled && result.filePaths[0]) {
    photoDirectory = result.filePaths[0];
    await ensurePhotoDirectory();
  }
  return photoDirectory;
});

ipcMain.handle('photo:open-directory', async () => {
  const directory = await ensurePhotoDirectory();
  await shell.openPath(directory);
});

ipcMain.handle('photo:save', async (_event, dataUrl) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/jpeg;base64,')) {
    throw new Error('Format d’image invalide');
  }
  const directory = await ensurePhotoDirectory();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `photobooth-${stamp}.jpg`;
  const fullPath = path.join(directory, filename);
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
  await fs.writeFile(fullPath, buffer);
  return { filename, fullPath };
});

ipcMain.handle('window:toggle-fullscreen', () => {
  const nextValue = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(nextValue);
  return nextValue;
});
