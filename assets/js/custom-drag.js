// castom drag

function makeWindowDraggable(elem) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  elem.addEventListener('mousedown', async (e) => {
    isDragging = true;
    console.log('dragging started');
    const { x, y } = await ipcRenderer.invoke('get-window-position');
    console.log(`Current window position: x=${x}, y=${y}`);
    offsetX = e.screenX - x;
    offsetY = e.screenY - y;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.screenX - offsetX;
    const y = e.screenY - offsetY;
    console.log(`Dragging to: x=${x}, y=${y}`);
    ipcRenderer.send('drag-window', x, y);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// ✅ Just call it:
makeWindowDraggable(document.querySelector('.drag'));

