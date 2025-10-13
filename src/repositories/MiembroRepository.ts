import { Database } from '../database/Database';

export class MiembroRepository {
    constructor(private db: Database) {}

    async crear(grupoId: number, nombre: string, email?: string): Promise<Miembro> {
        const result = await this.db.run(
            'INSERT INTO miembros (grupo_id, nombre, email) VALUES (?, ?, ?)',
            [grupoId, nombre, email || null]
        );
        
        return new Miembro(result.lastID!, nombre, email);
    }

    async obtenerPorGrupo(grupoId: number): Promise<Miembro[]> {
        const rows = await this.db.all(
            'SELECT * FROM miembros WHERE grupo_id = ? ORDER BY nombre',
            [grupoId]
        );
        
        return rows.map(row => new Miembro(row.id, row.nombre, row.email));
    }

    async obtenerPorId(id: number): Promise<Miembro | null> {
        const row = await this.db.get(
            'SELECT * FROM miembros WHERE id = ?',
            [id]
        );
        
        if (!row) return null;
        return new Miembro(row.id, row.nombre, row.email);
    }

    async eliminar(id: number): Promise<boolean> {
        const result = await this.db.run('DELETE FROM miembros WHERE id = ?', [id]);
        return result.changes! > 0;
    }
}

export class Miembro {
    constructor(
        public id: number,
        public nombre: string,
        public email?: string | null
    ) {}
}