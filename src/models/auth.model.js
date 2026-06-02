const pool = require('../config/db');
const { hashPassword } = require('../utils/password');

const Auth = {
  async generarPassTemporal(id) {
    const passTemporal = 'TEMP-' + Math.floor(1000 + Math.random() * 9000);
    const [r] = await pool.query(
      'UPDATE usuarios SET password = ?, debe_cambiar_pass = 1 WHERE id = ? AND activo = 1',
      [hashPassword(passTemporal), id]
    );
    return r.affectedRows ? passTemporal : null;
  },

  async cambiarPassword(id, nueva) {
    await pool.query(
      `UPDATE usuarios
       SET password = ?, debe_cambiar_pass = 0, ultimo_cambio_pass = NOW()
       WHERE id = ?`,
      [hashPassword(nueva), id]
    );
  },
};

module.exports = Auth;
