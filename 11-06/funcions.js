import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Fuerza a Node a buscar el archivo .env en la misma carpeta del script
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;

// 💡 RECOMENDACIÓN PARA PRUEBAS:
// Como estás probando un script local de consola, usa 'SUPABASE_SERVICE_ROLE_KEY'.
// Esto evitará que las políticas de seguridad (RLS) te bloqueen o te devuelvan tablas vacías.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: No se pudieron cargar las variables del archivo .env");
  console.log("Asegúrate de que el archivo .env contenga la URL y las llaves de Supabase.");
  process.exit(1);
}

// Inicialización del cliente apuntando al servidor local
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

/**
 * 1. Obtener todos los registros de una tabla
 */
async function obtenerRegistros(tabla) {
  const { data, error } = await supabase.from(tabla).select('*');
  if (error) {
    console.error(`❌ Error al obtener datos de ${tabla}:`, error.message);
    return null;
  }
  return data;
}

/**
 * 2. Obtener un registro específico por su llave primaria
 */
async function obtenerRegistroPorId(tabla, id, campoId = 'id') {
  const { data, error } = await supabase.from(tabla).select('*').eq(campoId, id);
  if (error) {
    console.error(`❌ Error al obtener el registro ${id} de ${tabla}:`, error.message);
    return null;
  }
  return data && data.length > 0 ? data[0] : null;
}

// ... Tus otras funciones (guardarRegistro, actualizarRegistro, eliminarRegistro) permanecen igual

// ════════════════════════════════════════════════════════════
// 🚀 BLOQUE DE EJECUCIÓN (Pruebas de Consola)
// ════════════════════════════════════════════════════════════
async function ejecutarPruebas() {
  console.log("⏳ Conectando con tu Supabase Local...");

  // Prueba 1: Obtener usuarios insertados por tu archivo SQL
  const usuarios = await obtenerRegistros('usuario');
  console.log("\n👥 Todos los Usuarios:");
  if (usuarios && usuarios.length > 0) {
    console.table(usuarios);
  } else {
    console.log("⚠️ No se encontraron usuarios. Verifica si ya ejecutaste el script SQL.");
  }

  // Prueba 2: Buscar la cédula específica del script populationdb.SQL
  console.log("\n🔍 Buscando usuario con cédula '1000000001'...");
  const unUsuario = await obtenerRegistroPorId('usuario', '1000000001', 'cedula');
  if (unUsuario) {
    console.log("✅ Usuario encontrado:", unUsuario);
  } else {
    console.log("⚠️ Usuario no encontrado en la base de datos.");
  }
}

ejecutarPruebas();