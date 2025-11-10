import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Crear carpeta database si no existe
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'gastos_grupales.db');
const db = new sqlite3.Database(dbPath);

// Inicializar schema
db.serialize(() => {
  // Usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Grupos
  db.run(`CREATE TABLE IF NOT EXISTS grupos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES usuarios (id)
  )`);

  // Miembros
  db.run(`CREATE TABLE IF NOT EXISTS miembros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    UNIQUE(grupo_id, usuario_id)
  )`);

  // Gastos
  db.run(`CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo_id INTEGER NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos (id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES usuarios (id)
  )`);

  // Participantes en gastos
  db.run(`CREATE TABLE IF NOT EXISTS participantes_gasto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gasto_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (gasto_id) REFERENCES gastos (id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    UNIQUE(gasto_id, usuario_id)
  )`);

  // Insertar usuarios demo
  const insertUser = db.prepare(`INSERT OR IGNORE INTO usuarios (username, password, email) VALUES (?, ?, ?)`);
  insertUser.run('demo', 'demo123', 'demo@example.com');
  insertUser.run('admin', 'admin123', 'admin@example.com');
  insertUser.run('user1', 'password1', 'user1@example.com');
  insertUser.run('juan', 'juan123', 'juan@example.com');
  insertUser.run('maria', 'maria123', 'maria@example.com');
  insertUser.run('carlos', 'carlos123', 'carlos@example.com');
  insertUser.finalize();

  console.log('✅ Base de datos SQLite inicializada en:', dbPath);
});

// RUTAS DE API

// Autenticación
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    'SELECT * FROM usuarios WHERE username = ? AND password = ?',
    [username, password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error del servidor' });
      }
      
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
    }
  );
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  
  db.run(
    'INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)',
    [username, password, email],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }
        return res.status(500).json({ error: 'Error del servidor' });
      }
      
      db.get('SELECT * FROM usuarios WHERE id = ?', [this.lastID], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json({ success: true, user });
      });
    }
  );
});

// Usuarios
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, email FROM usuarios ORDER BY username', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.json(users);
  });
});

// Grupos del usuario
app.get('/api/groups/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT DISTINCT g.*, u.username as creator_username
    FROM grupos g
    JOIN usuarios u ON g.created_by = u.id
    JOIN miembros m ON g.id = m.grupo_id
    WHERE m.usuario_id = ?
    ORDER BY g.created_at DESC
  `;
  
  db.all(query, [userId], (err, grupos) => {
    if (err) {
      return res.status(500).json({ error: 'Error del servidor' });
    }
    
    // Obtener miembros y gastos para cada grupo
    let completedGroups = 0;
    const totalGroups = grupos.length;
    
    if (totalGroups === 0) {
      return res.json([]);
    }
    
    grupos.forEach((grupo, index) => {
      // Obtener miembros
      db.all(
        `SELECT u.username FROM miembros m 
         JOIN usuarios u ON m.usuario_id = u.id 
         WHERE m.grupo_id = ? ORDER BY u.username`,
        [grupo.id],
        (err, members) => {
          if (err) {
            return res.status(500).json({ error: 'Error del servidor' });
          }
          
          grupos[index].members = members.map(m => m.username);
          
          // Obtener gastos
          db.all(
            `SELECT g.*, u.username as paid_by_username 
             FROM gastos g 
             JOIN usuarios u ON g.paid_by = u.id 
             WHERE g.grupo_id = ? ORDER BY g.created_at DESC`,
            [grupo.id],
            (err, expenses) => {
              if (err) {
                return res.status(500).json({ error: 'Error del servidor' });
              }
              
              // Obtener participantes para cada gasto
              let completedExpenses = 0;
              const totalExpenses = expenses.length;
              
              if (totalExpenses === 0) {
                grupos[index].expenses = [];
                completedGroups++;
                
                if (completedGroups === totalGroups) {
                  res.json(grupos);
                }
                return;
              }
              
              expenses.forEach((expense, expIndex) => {
                db.all(
                  `SELECT u.username FROM participantes_gasto pg 
                   JOIN usuarios u ON pg.usuario_id = u.id 
                   WHERE pg.gasto_id = ?`,
                  [expense.id],
                  (err, participants) => {
                    if (err) {
                      return res.status(500).json({ error: 'Error del servidor' });
                    }
                    
                    expenses[expIndex].splitBetween = participants.map(p => p.username);
                    completedExpenses++;
                    
                    if (completedExpenses === totalExpenses) {
                      grupos[index].expenses = expenses;
                      completedGroups++;
                      
                      if (completedGroups === totalGroups) {
                        res.json(grupos);
                      }
                    }
                  }
                );
              });
            }
          );
        }
      );
    });
  });
});

// Crear grupo
app.post('/api/groups', (req, res) => {
  const { name, description, created_by, members } = req.body;
  
  db.run(
    'INSERT INTO grupos (name, description, created_by) VALUES (?, ?, ?)',
    [name, description, created_by],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error del servidor' });
      }
      
      const grupoId = this.lastID;
      
      // Agregar miembros
      const memberInsert = db.prepare('INSERT OR IGNORE INTO miembros (grupo_id, usuario_id) VALUES (?, ?)');
      let completedMembers = 0;
      
      members.forEach(username => {
        db.get('SELECT id FROM usuarios WHERE username = ?', [username], (err, user) => {
          if (err || !user) {
            completedMembers++;
            if (completedMembers === members.length) {
              res.json({ success: true, id: grupoId });
            }
            return;
          }
          
          memberInsert.run(grupoId, user.id, (err) => {
            completedMembers++;
            if (completedMembers === members.length) {
              memberInsert.finalize();
              res.json({ success: true, id: grupoId });
            }
          });
        });
      });
    }
  );
});

// Agregar gasto
app.post('/api/expenses', (req, res) => {
  const { grupo_id, description, amount, paid_by_username, split_between } = req.body;
  
  // Obtener ID del usuario que pagó
  db.get('SELECT id FROM usuarios WHERE username = ?', [paid_by_username], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    db.run(
      'INSERT INTO gastos (grupo_id, description, amount, paid_by) VALUES (?, ?, ?, ?)',
      [grupo_id, description, amount, user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error del servidor' });
        }
        
        const gastoId = this.lastID;
        
        // Agregar participantes
        const participantInsert = db.prepare('INSERT INTO participantes_gasto (gasto_id, usuario_id) VALUES (?, ?)');
        let completedParticipants = 0;
        
        split_between.forEach(username => {
          db.get('SELECT id FROM usuarios WHERE username = ?', [username], (err, participant) => {
            if (err || !participant) {
              completedParticipants++;
              if (completedParticipants === split_between.length) {
                res.json({ success: true });
              }
              return;
            }
            
            participantInsert.run(gastoId, participant.id, (err) => {
              completedParticipants++;
              if (completedParticipants === split_between.length) {
                participantInsert.finalize();
                res.json({ success: true });
              }
            });
          });
        });
      }
    );
  });
});

// Eliminar gasto
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;

  // Si NO confías en que siempre sea número:
  const expenseId = Number(id);
  if (!Number.isInteger(expenseId)) {
    return res.status(400).send('ID de gasto inválido');
  }

  // Con PRAGMA foreign_keys=ON, borra en cascada participantes_gasto
  db.run('DELETE FROM gastos WHERE id = ?', [expenseId], function (err) {
    if (err) {
      console.error('DELETE /api/expenses error:', err);
      return res.status(500).send('No se pudo eliminar el gasto');
    }
    if (this.changes === 0) {
      return res.status(404).send('Gasto no encontrado');
    }
    // 204 = No Content
    return res.status(204).end();
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});