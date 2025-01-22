const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const db = require("./database");
const FileExtractor = require("./file_management");

// Declare common variables
let win;
let ip;
const api = new db();
const fe = new FileExtractor();

/**
 * Create and configure the main browser window
 */
function createWindow() {
    win = new BrowserWindow({
        title: "Modulous",
        width: 800,
        height: 600,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true, // Disable for security in production
            contextIsolation: false, // Enable for security in production
        },
    });

    // Load the initial page
    win.loadFile(path.join(__dirname, "renderer/static/index.html"));
}

/**
 * Load a specific page with a delay (e.g., for loading animation)
 *
 * @param {string} pagePath Path to the target HTML file
 */
function loadPageWithDelay(pagePath) {
    win.loadFile(path.join(__dirname, "renderer/static/loading.html"));
    setTimeout(() => {
        win.loadFile(path.join(__dirname, pagePath));
    }, 3000);
}

/**
 * Handle cleanup of ZIP files post-extraction
 *
 * @param {string[]} zipPaths Array of file paths to be deleted
 */
function cleanupFiles(zipPaths) {
    zipPaths.forEach((zipPath) => {
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
            console.log(`Deleted ZIP file: ${zipPath}`);
        }
    });
}

/**
 * Extract ZIP files, handle cleanup, and provide user feedback on errors
 *
 * @param {string[]} zipPaths Array of ZIP file paths to extract
 * @param {string} targetDir Target directory for extraction
 */
async function handleExtraction(zipPaths, targetDir) {
    try {
        // Extract all ZIP files
        zipPaths.forEach((zipPath) => fe.extract(zipPath, targetDir));

        // Cleanup ZIP files
        cleanupFiles(zipPaths);

        console.log("Files downloaded, extracted, and cleaned up successfully.");
    } catch (err) {
        console.error("Error during extraction:", err.message);

        // Extraction failed - prompt user for re-extraction
        const browserWindow = BrowserWindow.getFocusedWindow();
        const result = await dialog.showMessageBox(browserWindow, {
            type: "info",
            title: "Download Complete",
            message: "Download Complete. Would you like to re-extract the files?",
            buttons: ["Extract"],
        });

        // If the user opts to extract again, retry
        if (result.response === 0) {
            try {
                zipPaths.forEach((zipPath) => fe.extract(zipPath, targetDir));

                // Cleanup after re-extraction
                cleanupFiles(zipPaths);
            } catch (reExtractErr) {
                console.error("Error during re-extraction:", reExtractErr.message);
            }
        }
    }
}

/**
 * IPC Event Handlers
 */
ipcMain.on("button-click", (event, button) => {
    console.log(`${button} button clicked!`);
    switch (button) {
        case "client":
            console.log("Loading client page...");
            loadPageWithDelay("renderer/static/client.html");
            break;
        case "server":
            console.log("Loading server page...");
            loadPageWithDelay("renderer/static/server.html");
            break;
        case "client_address":
            console.log("Loading client address...");
            break;
        default:
            console.error("Unknown button clicked!");
    }
});

ipcMain.on("client_next", (event, ipAddress) => {
    ip = ipAddress;
    console.log(`Next button clicked with IP address: ${ip}`);
    win.loadFile(path.join(__dirname, "renderer/static/client-username-password.html"));
});

ipcMain.on("client_connect", async (event, user, pass) => {
    const jsonData = {
        username: user,
        password: pass,
        ip_address: ip,
    };

    console.log("Attempting to log in...");

    try {
        // Attempt login
        await api.login(jsonData);
        console.log("Validation successful. Proceeding to file download...");

        // Paths for download and extraction
        const modsZipPath = "./downloads/mods.zip";
        const configsZipPath = "./downloads/configs.zip";
        const zipPaths = [modsZipPath, configsZipPath];

        // Download files
        api.download_mods(modsZipPath);
        api.download_configs(configsZipPath);

        // Handle extraction and cleanup
        await handleExtraction(zipPaths, "./downloads");
    } catch (err) {
        console.error("Login or download process failed:", err.message);
    }
});

ipcMain.on("back_button1", () => {
    console.log("Back button clicked! Returning to index page.");
    win.loadFile(path.join(__dirname, "renderer/static/index.html"));
});

ipcMain.on("back_button2", () => {
    console.log("Back button clicked! Returning to client page.");
    win.loadFile(path.join(__dirname, "renderer/static/client.html"));
});

/**
 * Electron App Lifecycle
 */
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});