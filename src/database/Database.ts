import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';
import fs from 'fs';
import path from 'path';

export class Database {
  private static instance: Database | null = null;
  private db: SqliteDatabase | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      // Crear carpeta data si no existe
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Conectar a la base de datos en la carpeta data
      const dbPath = path.join(dataDir, 'gastos_grupales.db');
      
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Ejecutar el schema si es necesario
      await this.initializeSchema();
      
      console.log(`✅ Conectado a la base de datos SQLite: ${dbPath}`);
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  private async initializeSchema(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await this.db!.exec(schema);
      console.log('✅ Schema inicializado');
    }
  }

  public getDb(): SqliteDatabase {
    if (!this.db) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }
    return this.db;
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('✅ Conexión a base de datos cerrada');
    }
  }
}

export default Database;