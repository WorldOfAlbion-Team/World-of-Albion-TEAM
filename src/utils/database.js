import pg from "pg";

const { Pool } = pg;

// Render usa DATABASE_URL automáticamente desde tu Environment Group
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERROR: No existe DATABASE_URL en las variables de entorno.");
    process.exit(1);
}

// Crear pool de conexión
export const db = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Función para probar conexión
export async function testDB() {
    try {
        await db.query("SELECT NOW()");
        console.log("🟢 Conectado a PostgreSQL correctamente.");
    } catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
    }
}
