const { ipcRenderer } = require('electron');

document.getElementById('clientButton').addEventListener('click', () => {
    ipcRenderer.send('button-click', 'client');
});

document.getElementById('serverButton').addEventListener('click', () => {
    ipcRenderer.send('button-click', 'server');
});