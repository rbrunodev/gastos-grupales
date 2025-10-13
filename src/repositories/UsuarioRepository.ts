import { Database } from '../database/Database';

export interface Usuario {
  id?: number;
  username: string;
  password: string;
  email?: string;
  created_at?: string;
}

export class UsuarioRepository {
  private db = Database.getInstance();

  async findByUsername(username: string): Promise<Usuario | null> {
    const database = this.db.getDb();
    const usuario = await database.get(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    );
    return usuario || null;
  }

  async findById(id: number): Promise<Usuario | null> {
    const database = this.db.getDb();
    const usuario = await database.get(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    return usuario || null;
  }

  async create(usuario: Omit<Usuario, 'id' | 'created_at'>): Promise<Usuario> {
    const database = this.db.getDb();
    const result = await database.run(
      'INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)',
      [usuario.username, usuario.password, usuario.email]
    );
    
    return this.findById(result.lastID!) as Promise<Usuario>;
  }

  async authenticate(username: string, password: string): Promise<Usuario | null> {
    const database = this.db.getDb();
    const usuario = await database.get(
      'SELECT * FROM usuarios WHERE username = ? AND password = ?',
      [username, password]
    );
    return usuario || null;
  }

  async getAll(): Promise<Usuario[]> {
    const database = this.db.getDb();
    return await database.all('SELECT * FROM usuarios ORDER BY username');
  }
}