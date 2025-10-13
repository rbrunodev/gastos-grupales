import { Database } from './database/Database';

async function testDatabase() {
    console.log('Inicializando base de datos...');
    
    try {
        const db = new Database();
        console.log('Base de datos creada exitosamente');
        
        // Esperar un momento para que se complete la inicialización
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await db.close();
        console.log('Conexión cerrada');
    } catch (error) {
        console.error('Error:', error);
    }
}

testDatabase();