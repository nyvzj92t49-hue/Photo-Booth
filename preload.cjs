const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('photobooth', {
  getDirectory: () => ipcRenderer.invoke('photo:get-directory'),
  chooseDirectory: () => ipcRenderer.invoke('photo:choose-directory'),
  openDirectory: () => ipcRenderer.invoke('photo:open-directory'),
  savePhoto: (dataUrl) => ipcRenderer.invoke('photo:save', dataUrl),
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen')
});
