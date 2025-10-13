import { Database } from '../database/Database';

export interface Grupo {
  id?: number;
  name: string;
  description?: string;
  created_by: number;
  created_at?: string;
  members?: string[];
  expenses?: Gasto[];
}

export interface Gasto {
  id?: number;
  grupo_id: number;
  description: string;
  amount: number;
  paid_by: number;
  paid_by_username?: string;
  created_at?: string;
  splitBetween?: string[];
}

export class GrupoRepository {
  private db = Database.getInstance();

  async findAll(userId: number): Promise<Grupo[]> {
    const database = this.db.getDb();
    const grupos = await database.all(`
      SELECT DISTINCT g.*, u.username as creator_username
      FROM grupos g
      JOIN usuarios u ON g.created_by = u.id
      JOIN miembros m ON g.id = m.grupo_id
      WHERE m.usuario_id = ?
      ORDER BY g.created_at DESC
    `, [userId]);

    // Obtener miembros y gastos para cada grupo
    for (const grupo of grupos) {
      grupo.members = await this.getGroupMembers(grupo.id);
      grupo.expenses = await this.getGroupExpenses(grupo.id);
    }

    return grupos;
  }

  async findById(id: number): Promise<Grupo | null> {
    const database = this.db.getDb();
    const grupo = await database.get(`
      SELECT g.*, u.username as creator_username
      FROM grupos g
      JOIN usuarios u ON g.created_by = u.id
      WHERE g.id = ?
    `, [id]);

    if (grupo) {
      grupo.members = await this.getGroupMembers(id);
      grupo.expenses = await this.getGroupExpenses(id);
    }

    return grupo || null;
  }

  async create(grupo: Omit<Grupo, 'id' | 'created_at'>, memberUsernames: string[]): Promise<Grupo> {
    const database = this.db.getDb();
    
    // Crear el grupo
    const result = await database.run(
      'INSERT INTO grupos (name, description, created_by) VALUES (?, ?, ?)',
      [grupo.name, grupo.description, grupo.created_by]
    );

    const grupoId = result.lastID!;

    // Agregar miembros
    for (const username of memberUsernames) {
      const usuario = await database.get('SELECT id FROM usuarios WHERE username = ?', [username]);
      if (usuario) {
        await database.run(
          'INSERT OR IGNORE INTO miembros (grupo_id, usuario_id) VALUES (?, ?)',
          [grupoId, usuario.id]
        );
      }
    }

    return this.findById(grupoId) as Promise<Grupo>;
  }

  async addExpense(expense: Omit<Gasto, 'id' | 'created_at'>, splitBetween: string[]): Promise<void> {
    const database = this.db.getDb();
    
    // Crear el gasto
    const result = await database.run(
      'INSERT INTO gastos (grupo_id, description, amount, paid_by) VALUES (?, ?, ?, ?)',
      [expense.grupo_id, expense.description, expense.amount, expense.paid_by]
    );

    const gastoId = result.lastID!;

    // Agregar participantes
    for (const username of splitBetween) {
      const usuario = await database.get('SELECT id FROM usuarios WHERE username = ?', [username]);
      if (usuario) {
        await database.run(
          'INSERT INTO participantes_gasto (gasto_id, usuario_id) VALUES (?, ?)',
          [gastoId, usuario.id]
        );
      }
    }
  }

  private async getGroupMembers(grupoId: number): Promise<string[]> {
    const database = this.db.getDb();
    const members = await database.all(`
      SELECT u.username
      FROM miembros m
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.grupo_id = ?
      ORDER BY u.username
    `, [grupoId]);

    return members.map(m => m.username);
  }

  private async getGroupExpenses(grupoId: number): Promise<Gasto[]> {
    const database = this.db.getDb();
    const expenses = await database.all(`
      SELECT g.*, u.username as paid_by_username
      FROM gastos g
      JOIN usuarios u ON g.paid_by = u.id
      WHERE g.grupo_id = ?
      ORDER BY g.created_at DESC
    `, [grupoId]);

    // Obtener participantes para cada gasto
    for (const expense of expenses) {
      const participants = await database.all(`
        SELECT u.username
        FROM participantes_gasto pg
        JOIN usuarios u ON pg.usuario_id = u.id
        WHERE pg.gasto_id = ?
      `, [expense.id]);

      expense.splitBetween = participants.map(p => p.username);
    }

    return expenses;
  }
}