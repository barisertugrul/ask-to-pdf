const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;
let isPythonProcessTerminated = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets/img/icon-white.png'), // Set the application icon
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
        terminatePythonProcess('mainWindow closed event');
    });

    // Create the application menu
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
        }
    ]);

    Menu.setApplicationMenu(menu);
}

function terminatePythonProcess(event) {
    if (pythonProcess && !isPythonProcessTerminated) {
        console.log(`Terminating Python process from ${event}...`);
        pythonProcess.kill('SIGTERM');
        pythonProcess.on('close', () => {
            console.log('Python process killed successfully');
            isPythonProcessTerminated = true;
        });
    }
}

app.on('ready', () => {
    pythonProcess = spawn('python', ['app.py']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === null) {
            console.error('Python process exited with error code: null');
        } else {
            console.log(`child process exited with code ${code}`);
            if (code !== 0) {
                console.error(`Python process exited with error code: ${code}`);
            } else {
                console.log('Python process terminated successfully');
            }
        }
        isPythonProcessTerminated = true;
    });

    createWindow();
});

app.on('window-all-closed', function () {
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
    terminatePythonProcess('before-quit event');
    while (!isPythonProcessTerminated) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    app.exit();
});