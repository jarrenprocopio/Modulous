const {writeFile} = require("node:fs");
const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron'); // Electron's ipcRenderer


class API {
    constructor() {

    }

    createUser(jsonData) {
        fetch('http://localhost:3000/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error('Error:', err));
    }

    login(jsonData) {
        return fetch('http://localhost:3000/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
            .then(res => res.json()) // Parse JSON response
            .then(data => {
                if (data.validate) {
                    // Validation is successful
                    console.log("Login successful:", data);
                    return data; // Return server response (e.g., admin status)
                } else {
                    // Validation failed
                    console.error("Login failed:", data.error);
                    if (data.disabled_reason) {
                        console.error("Account disabled reason:", data.disabled_reason);
                    }
                    throw new Error(data.error); // Reject the promise with the error message
                }
            })
            .catch(err => {
                console.error('Error during validation:', err.message);
                throw err; // Ensure error propagates to the caller
            });
    }

    download_mods(savePath) {
        fetch("http://localhost:3000/files/mods.zip", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob(); // Convert to Blob
            })
            .then((blob) => {
                // Convert the Blob to a Node.js Buffer
                blob.arrayBuffer().then((arrayBuffer) => {
                    const buffer = Buffer.from(arrayBuffer);

                    // Ensure that the save path is a valid path
                    const absoluteSavePath = path.resolve(savePath);

                    // Use Node.js filesystem API to save the file
                    writeFile(absoluteSavePath, buffer, (err) => {
                        if (err) {
                            return console.error('File write failed:', err);
                        }
                        console.log('File saved to:', absoluteSavePath);
                    });
                });
            })
            .catch((error) => {
                console.error('File download failed:', error);
            });
    }

    download_configs(savePath) {
        fetch("http://localhost:3000/files/configs.zip", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob(); // Convert to Blob
            })
            .then((blob) => {
                // Convert the Blob to a Node.js Buffer
                blob.arrayBuffer().then((arrayBuffer) => {
                    const buffer = Buffer.from(arrayBuffer);

                    // Ensure that the save path is a valid path
                    const absoluteSavePath = path.resolve(savePath);

                    // Use Node.js filesystem API to save the file
                    writeFile(absoluteSavePath, buffer, (err) => {
                        if (err) {
                            return console.error('File write failed:', err);
                        }
                        console.log('File saved to:', absoluteSavePath);
                    });
                });
            })
            .catch((error) => {
                console.error('File download failed:', error);
            });
    }
}


module.exports = API


