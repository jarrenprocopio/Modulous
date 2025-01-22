const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

class FileExtractor {
    /**
     * Extracts a zip file to the specified directory.
     * @param {string} zipFilePath - The path to the zip file.
     * @param {string} targetDir - The directory where files will be extracted.
     */
    extract(zipPath, targetDir) {
        const zip = new AdmZip(zipPath);
        const zipNameWithoutExt = path.basename(zipPath, path.extname(zipPath)); // "mods" or "configs"
        const targetFolder = path.join(targetDir, zipNameWithoutExt);

        try {
            // If the target folder exists, move it
            if (fs.existsSync(targetFolder)) {
                console.log(`Folder "${targetFolder}" exists. Backing it up...`);

                // Create "old mods" or "old configs" folder in the parent directory
                const parentDir = path.dirname(targetDir);
                const backupFolderName = `old ${zipNameWithoutExt}`; // "old mods" or "old configs"
                const backupFolderPath = path.join(parentDir, backupFolderName);

                if (!fs.existsSync(backupFolderPath)) {
                    fs.mkdirSync(backupFolderPath, { recursive: true });
                }

                // Create a ZIP of the existing target folder
                const backupZipPath = path.join(backupFolderPath, `${zipNameWithoutExt}-${Date.now()}.zip`);
                const folderToBackupZip = new AdmZip();

                folderToBackupZip.addLocalFolder(targetFolder); // Add the folder contents to the ZIP
                folderToBackupZip.writeZip(backupZipPath); // Write ZIP file to the backup path
                console.log(`Backed up to: ${backupZipPath}`);

                // Remove the old folder before replacing it
                fs.rmdirSync(targetFolder, { recursive: true });
            }

            // Extract the new content to the target folder
            console.log(`Extracting ZIP (${zipPath}) to "${targetFolder}"...`);
            zip.extractAllTo(targetFolder, true);
            console.log(`Successfully extracted to "${targetFolder}".`);
        } catch (err) {
            console.error(`Error during extraction: ${err.message}`);
            throw err; // Propagate errors upward
        }
    }

    /**
     * Checks if the specified directory exists.
     * @param {string} dirPath - Path of the directory.
     * @returns {boolean} True if the directory exists, false otherwise.
     */
    isDirectoryExists(dirPath) {
        return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
    }

    /**
     * List all files in the extracted directory.
     * @param {string} targetDir - Path of the directory to list files from.
     * @returns {string[]} List of file names in the directory.
     */
    listFiles(targetDir) {
        if (!this.isDirectoryExists(targetDir)) {
            throw new Error(`Directory not found: ${targetDir}`);
        }

        return fs.readdirSync(targetDir);
    }
}

module.exports = FileExtractor;