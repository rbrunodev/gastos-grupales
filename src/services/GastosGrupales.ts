import { Database } from '../database/Database';
import { GrupoRepository } from '../repositories/GrupoRepository';
import { MiembroRepository } from '../repositories/MiembroRepository';

export class GastosGrupales {
    private db: Database;
    private grupoRepo: GrupoRepository;
    private miembroRepo: MiembroRepository;

    constructor() {
        this.db = new Database();
        this.grupoRepo = new GrupoRepository(this.db);
        this.miembroRepo = new MiembroRepository(this.db);
    }

    async crearGrupo(nombre: string, descripcion?: string) {
        return await this.grupoRepo.crear(nombre, descripcion);
    }

    async obtenerGrupos() {
        return await this.grupoRepo.obtenerTodos();
    }

    async agregarMiembro(grupoId: number, nombre: string, email?: string) {
        return await this.miembroRepo.crear(grupoId, nombre, email);
    }

    async obtenerMiembros(grupoId: number) {
        return await this.miembroRepo.obtenerPorGrupo(grupoId);
    }

    async cerrarConexion() {
        await this.db.close();
    }
}