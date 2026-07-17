require('dotenv').config();

module.exports = {
  puerto: process.env.PUERTO || 4000,
  secretoJwt: process.env.SECRETO_JWT || 'secreto_dev_no_usar_en_produccion',
  jwtExpiraEn: process.env.JWT_EXPIRA_EN || '7d',
  rutaBd: process.env.RUTA_BD || './data/finanzas.db',
  admin: {
    nombre: process.env.ADMIN_NOMBRE || 'Administrador',
    correo: process.env.ADMIN_CORREO || 'admin@example.com',
    contrasena: process.env.ADMIN_CONTRASENA || 'cambia_esta_contrasena',
  },
  vapid: {
    clavePublica: process.env.VAPID_CLAVE_PUBLICA || '',
    clavePrivada: process.env.VAPID_CLAVE_PRIVADA || '',
    asunto: process.env.VAPID_ASUNTO || 'mailto:admin@example.com',
  },
};
