/** Módulos de Electron */
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

/** Módilos de Node */
const url = require('url');
const path = require('path');

// Entonrno en el que se está trabajando
if (process.env.NODE_ENV !== 'production')
    // Indicar qué procesos reiniciar: subprocesos, ventanas, etc.
    require('electron-reload')(__dirname, {
        // Refresca vistas (HTML) por defecto
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron') // Indicar ruta donde escuchará cambios
    });

let mainWindow;
let newProductWindow;

// Escuchar cuando la app inicia
app.on('ready', () => {
    // Propiedades para la ventana
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(url.format({
        // __dirname: constante de node que equivale a src concatenado a una dirección
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'File', // Será un archivo
        slashes: true // Indica que carga a traves de una dir de navegador
    })); // Indicar ubicación del archivo

    // Configurar menú de ventana
    
    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu); // Cargar vista

    mainWindow.on('closed', () => {
        app.quit();
    });
});

function createNewProductWindow() {
    newProductWindow = new BrowserWindow({
        width: 400,
        height: 330,
        title: 'Add A New Product'
    });
    newProductWindow.setMenu(null); // Quitar menu
    newProductWindow.loadURL(url.format({
        // __dirname: constante de node que equivale a src concatenado a una dirección
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'File', // Será un archivo
        slashes: true // Indica que carga a traves de una dir de navegador
    }));

    newProductWindow.on('closed', () => {
        newProductWindow = null;
    });
}

ipcMain.on('product:new', (e, newProduct) => {
    mainWindow.webContents.send('product:new', newProduct);
    newProductWindow.close();
});

const templateMenu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Product',
                accelerator: process.platform == 'darwin' ? 'command+N' : 'Ctrl+N',
                click() {
                    // Crear ventana
                    createNewProductWindow();
                }
            },
            {
                label: 'Remove All Products',
                click() {
                    mainWindow.webContents.send('products:remove-all');
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// Agregar nombre en caso de estar en MAC
if (process.platform === 'darwin') {
    templateMenu.unshift({
        label: app.getName() // Nombre de App
    });
}

// Herramientas
if (process.env.NODE_ENV != 'production') {
    templateMenu.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide DevTools',
                accelerator: 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}