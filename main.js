const { app, BrowserWindow, Menu, session, shell } = require('electron');
const path = require('path');
const { spawn, execFile, exec } = require('child_process');
const fs = require('fs');
const kill = require('tree-kill');

let mainWindow;
let pythonProcess;
let isPythonProcessTerminated = false;

function runPython() {
    return new Promise((resolve, reject) => {
        pythonProcess = execFile(
            path.join(__dirname, "app.exe"),
            [],
            {
                windowsHide: true,
                shell: true,
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
            }
        );

        setTimeout(function() {
            resolve();
        }, 1000);
    });
}

function killPython() {
    if (pythonProcess) {
        kill(pythonProcess.pid, 'SIGTERM', (err) => {
            if (err) {
                console.error('Failed to kill Python process:', err);
            } else {
                console.log('Python process killed successfully');
                isPythonProcessTerminated = true;
            }
        });
    }
}

function checkAndKillOldApp() {
    return new Promise((resolve, reject) => {
        exec('tasklist', (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                if (stdout.toLowerCase().indexOf('ask-to-pdf.exe') > -1) {
                    exec('taskkill /IM ask-to-pdf.exe /F', (err, stdout, stderr) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Old application terminated successfully');
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            }
        });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets/img/icon-white.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
        killPython();
    });

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Home',
                    click: () => {
                        mainWindow.loadFile('index.html');
                    }
                },
                {
                    label: 'Settings',
                    click: () => {
                        mainWindow.loadFile('settings.html');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'GitHub Repo',
            click: () => {
                shell.openExternal('https://github.com/barisertugrul/ask-to-pdf')
            }
        },
        {
            label: 'Website',
            click: () => {
                shell.openExternal('http://www.barisertugrul.com')
            }
        }
    ]);

    Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
    session.defaultSession.clearCache().then(() => {
        console.log('Cache temizlendi.');
    }).catch((error) => {
        console.error('Cache temizlenirken hata oluştu:', error);
    });

    checkAndKillOldApp().then(() => {
        runPython().then(() => {
            createWindow();
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.error('Failed to terminate old application:', error);
    });
});

app.on('window-all-closed', function () {
    killPython();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', async (event) => {
    event.preventDefault();
    killPython();
    while (!isPythonProcessTerminated) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    app.exit();
});