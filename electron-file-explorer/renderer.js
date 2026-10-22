const showDirectoryButton = document.getElementById('show-directory');
const saveNoteButton = document.getElementById('save-note');
const directoryPath = document.getElementById('directory-path');
const directoryList = document.getElementById('directory-list');
const itemCount = document.getElementById('item-count');
const noteText = document.getElementById('note-text');
const fileStatus = document.getElementById('file-status');
const noteStatus = document.getElementById('note-status');

function showStatus(element, message, kind = 'normal') {
  element.textContent = message;
  element.dataset.kind = kind;
}

async function loadDirectory() {
  showDirectoryButton.disabled = true;
  showStatus(fileStatus, 'Читаем содержимое каталога…');
  directoryList.replaceChildren();

  try {
    const result = await window.api.listDir('.');
    directoryPath.textContent = result.directory;
    itemCount.textContent = String(result.entries.length);

    if (result.entries.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-list';
      empty.textContent = 'Каталог пуст.';
      directoryList.append(empty);
    }

    for (const entry of result.entries) {
      const item = document.createElement('li');
      item.className = 'file-entry';
      const icon = document.createElement('span');
      icon.className = entry.isDir ? 'file-icon directory-icon' : 'file-icon';
      icon.textContent = entry.isDir ? '▣' : '▤';
      const label = document.createElement('span');
      label.className = entry.isDir ? 'file-name directory-name' : 'file-name';
      label.textContent = entry.name;
      const type = document.createElement('span');
      type.className = 'file-type';
      type.textContent = entry.isDir ? 'Папка' : 'Файл';
      item.append(icon, label, type);
      directoryList.append(item);
    }

    showStatus(fileStatus, `Список получен: ${result.entries.length} элементов.`, 'success');
  } catch (error) {
    itemCount.textContent = '0';
    showStatus(fileStatus, `Ошибка чтения: ${error.message}`, 'error');
  } finally {
    showDirectoryButton.disabled = false;
  }
}

async function saveNote() {
  const value = noteText.value;
  if (!value.trim()) {
    showStatus(noteStatus, 'Сначала введи текст заметки.', 'error');
    noteText.focus();
    return;
  }

  saveNoteButton.disabled = true;
  showStatus(noteStatus, 'Ожидаем выбор файла…');

  try {
    const result = await window.api.saveNote(value);
    if (result.status === 'canceled') {
      showStatus(noteStatus, 'Сохранение отменено.');
    } else {
      showStatus(noteStatus, `Заметка сохранена: ${result.filePath}`, 'success');
    }
  } catch (error) {
    showStatus(noteStatus, `Ошибка сохранения: ${error.message}`, 'error');
  } finally {
    saveNoteButton.disabled = false;
  }
}

showDirectoryButton.addEventListener('click', loadDirectory);
saveNoteButton.addEventListener('click', saveNote);
loadDirectory();
