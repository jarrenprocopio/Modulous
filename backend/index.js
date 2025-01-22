const express = require('express')
const sql = require('sqlite3').verbose()
const bcrypt = require('bcrypt');
const app = express()
const port = 3000
const saltRounds = 10
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

app.use(express.json());


const db = new sql.Database('db.db', (err) => {
    if (err) {
        console.log(err)
    } else
        console.log('Database Connected')
})

app.post("/create-user", async (req, res) => {
    const { username, password, ip_address } = req.body;

    // Check if required fields are present
    if (!username || !password || !ip_address) {
        return res.json({ validate: false, error: "Incomplete credentials" });
    }

    try {
        // Hash the password asynchronously
        const passwordHash = await hashPassword(password);

        // Insert data into the database
        const stmt = db.prepare(
            "INSERT INTO creds (username, password, ip_address, privilege, disabled, disabled_reason) VALUES (?, ?, ?, ?, ?, ?)"
        );

        stmt.run(username, passwordHash, ip_address, 0, 0, null, (err) => {
            if (err) {
                console.error('Error inserting into database:', err.message);
                return res.json({ complete: false, error: "Database error" });
            }

            // If successful
            res.json({ complete: true });
        });

        stmt.finalize();
    } catch (error) {
        console.error('Error hashing password:', error.message);
        res.status(500).json({ complete: false, error: "Internal server error" });
    }
});

// Updated hashPassword function to return a Promise
function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                return reject(err);
            }
            resolve(hash);
        });
    });
}

app.get('/get-files', (req, res) => {
    const files = ["mods.zip", "configs.zip"]; // Files to serve
    const fileDirectory = path.join(__dirname, 'modulous'); // Directory where files are stored

    const availableFiles = files.map(file => {
        const filePath = path.join(fileDirectory, file);

        // Log the file's existence and its resolved path
        console.log(`Checking file: ${filePath}`);
        if (fs.existsSync(filePath)) {
            console.log(`File found: ${filePath}`);
            return {
                name: file,
                url: `http://localhost:3000/files/${file}`
            };
        } else {
            console.error(`File not found: ${filePath}`);
            return null;
        }
    }).filter(Boolean); // Ensure only valid files are returned

    if (availableFiles.length === 0) {
        console.error("No files available for download");
        return res.status(404).json({ success: false, message: "No files available for download" });
    }

    console.log("Available files for download:", availableFiles);

    // Return the list of available files as JSON
    return res.json({ success: true, files: availableFiles });
});
// Static route to serve files
app.use('/files', express.static(path.join(__dirname, 'modulous')));

app.post('/validate', (req, res) => {
    const { username, password, ip_address } = req.body;
    let admin = false;
    let disabled = false;
    let disabled_reason = null;

    // CHECK FOR COMPLETE CREDENTIALS
    if (!username || !password || !ip_address) {
        return res.json({ validate: false, error: "Incomplete credentials" });
    }

    // Retrieve user data from the database
    db.get("SELECT * FROM creds WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.json({ validate: false, error: "Database error" });
        }

        if (!row) {
            return res.json({ validate: false, error: "Incorrect username or password" });
        }

        // Check for privilege and disabled status
        if (row["privilege"] === 2) {
            admin = true;
        }

        if (row["disabled"] === 1) {
            disabled = true;
            disabled_reason = row["disabled_reason"];
        }

        if (disabled) {
            return res.json({ validate: false, error: "Disabled", disabled_reason });
        }

        // Compare the provided password with the stored hashed password
        bcrypt.compare(password, row["password"], (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err.message);
                return res.json({ validate: false, error: "Internal server error" });
            }

            if (isMatch) {
                return res.json({ validate: true, admin });
            } else {
                return res.json({ validate: false, error: "Incorrect username or password" });
            }
        });
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:3000/`)
})
