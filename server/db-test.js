const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'test.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;", (err) => {
    console.log("Foreign keys enabled:", !err);
  });

  db.run(`
    CREATE TABLE roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `, (err) => {
    console.log("Roles table created:", !err);
  });

  db.run(`
    CREATE TABLE permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `, (err) => {
    console.log("Permissions table created:", !err);
  });

  db.run(`
    CREATE TABLE role_permissions (
      role_id INTEGER,
      permission_id INTEGER,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )
  `, (err) => {
    console.log("Role Permissions table created:", !err);
  });

  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      role_id INTEGER,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    )
  `, (err) => {
    console.log("Users table created:", !err);
  });

  // Inserts
  db.run("INSERT INTO roles (id, name, description) VALUES (1, 'Super Admin', 'Admin')", (err) => {
    console.log("Role 1 inserted:", !err, err ? err.message : '');
  });

  db.run("INSERT INTO permissions (id, name, code, description) VALUES (1, 'Full Control', 'full_control', 'Desc')", (err) => {
    console.log("Permission 1 inserted:", !err, err ? err.message : '');
  });

  // Verify selections
  db.all("SELECT id, code FROM permissions", [], (err, rows) => {
    console.log("Fetched permissions inside serialize callback:", rows);
    if (rows && rows.length > 0) {
      db.run("INSERT INTO role_permissions (role_id, permission_id) VALUES (1, ?)", [rows[0].id], (err) => {
        console.log("Inserted role_permissions mapping:", !err, err ? err.message : '');
      });
    }
  });

  db.run("INSERT INTO users (username, role_id) VALUES ('Ajay', 1)", (err) => {
    console.log("User inserted:", !err, err ? err.message : '');
  });
});
