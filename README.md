# Modulous
Modulous is a **cross-platform Electron-based application** designed to simplify the process of connecting to Minecraft servers and automatically downloading the required mod packs and configuration files. With Modulous, players can set up their client environment quickly without manually hunting for or managing mods or configurations.

![welcometomod](https://github.com/user-attachments/assets/311f1f97-964e-4cba-a2b0-5fc90345308a)

## 🎮 Features
- **Mod & Config Downloads:** Automatically download server-specified mod packs and configuration files.
- **Automatic Extraction:** Extracts the downloaded `.zip` files into the correct directories.
- **Backup System:** Existing `mods` or `configs` folders are backed up and saved as `.zip` files in `old mods` or `old configs` directories with options to rollback.
- **Easy-to-Use Interface:** Simple navigation to `Client` and `Server` workflows within the app.
- **Cross-Platform Support:** Works on Windows, macOS, and Linux.

## 🛠️ Technologies Used
- **Electron:** Cross-platform desktop applications using JavaScript, HTML, and CSS.
- **Node.js:** Backend server-side logic.
- **adm-zip:** For handling ZIP file compression and extraction.
- **basic-ftp:** Connect to servers and transfer files as an FTP client.
- **JavaScript ES6+:** Core development language for this project.

## How It Works
1. **User Workflow**
    - Select either `Client` or `Server` from the main page.
    - As a client player:
        - Enter the IP address of the Minecraft server in `Client Address`.
        - Login using the provided credentials (username and password).

    - Modulous will:
        - Connect to the specified server.
        - Download the required `mods.zip` and `configs.zip`.
        - Extract these archives into their respective directories: `downloads/mods/` and `downloads/configs/`.
        - Backup any existing mods/configs into the `old mods` and `old configs` directories for safety.

    - The downloaded mods pack is deleted after extraction to keep the application clean.

2. **Server Workflow**
    - [Future Feature] Allows server admins to upload mod packs and configurations for client distribution.

3. **Error Handling**
    - If the extraction fails, the app will prompt users to retry.
    - The app ensures no files are overwritten and keeps backups of existing data for safety.

## 🚨 Known Issues
- **Platform-Specific File Permissions:** On some operating systems, permissions may restrict folder deletions or manipulation. Use `sudo` or ensure the app has the correct permissions to execute file operations.
- **In Development - Server Flow:** Currently, the server-side functionality is under development. Stay tuned for future updates.
- **Large Mod Packs:** Extremely large mod packs may temporarily freeze the application during extraction.

## 🎉 Acknowledgments
Special thanks to:
- The Minecraft community for inspiring this project.
- Serrato and Bethea for inspiring me to revive this project
- Developers of `adm-zip` and `basic-ftp` for making ZIP file and FTP handling easier.
