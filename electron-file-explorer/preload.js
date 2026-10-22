const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listDir: directory => ipcRenderer.invoke('list-dir', directory),
  saveNote: text => ipcRenderer.invoke('save-note', text)
});
