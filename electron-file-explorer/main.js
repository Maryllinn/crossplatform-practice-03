const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 720,
    minWidth: 800,
    minHeight: 570,
    title: 'Electron File Explorer',
    backgroundColor: '#f4f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
}

app.whenReady().then(() => {
  ipcMain.handle('list-dir', async (_event, directory) => {
    if (directory !== '.') {
      throw new Error('Можно просмотреть только рабочий каталог приложения.');
    }

    const entries = await fs.readdir('.', { withFileTypes: true });
    const items = entries.map(entry => ({
      name: entry.name,
      isDir: entry.isDirectory()
    }));

    items.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name, 'ru');
    });

    return { directory: process.cwd(), entries: items };
  });

  ipcMain.handle('save-note', async (event, text) => {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Введите текст заметки.');
    }
    if (text.length > 100000) {
      throw new Error('Заметка слишком длинная (максимум 100 000 символов).');
    }

    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    if (!parentWindow || parentWindow !== mainWindow) {
      throw new Error('Неизвестное окно приложения.');
    }

    const { canceled, filePath } = await dialog.showSaveDialog(parentWindow, {
      title: 'Сохранить заметку',
      defaultPath: path.join(app.getPath('documents'), 'заметка.txt'),
      buttonLabel: 'Сохранить',
      filters: [{ name: 'Текстовые файлы', extensions: ['txt'] }]
    });

    if (canceled || !filePath) return { status: 'canceled' };

    await fs.writeFile(filePath, text, 'utf8');
    return { status: 'saved', filePath };
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
