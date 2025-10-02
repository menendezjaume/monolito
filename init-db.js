const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

// Abrir/crear la base de datos
const db = new Database('./database.sqlite');

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )
`).run();

// Función para crear usuario con contraseña hasheada
function createUser(username, password, role) {
  const hash = bcrypt.hashSync(password, 10); // síncrono
  try {
    db.prepare(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`)
      .run(username, hash, role);
    console.log(`Usuario ${username} (${role}) creado ✅`);
  } catch (err) {
    console.error(`Error creando usuario ${username}:`, err.message);
  }
}

// Crear dos usuarios
createUser('admin', 'admin123', 'admin');
createUser('user', 'user123', 'user');
