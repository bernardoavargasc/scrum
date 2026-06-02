/* Manejo de contraseñas en un solo lugar.
   Si más adelante se usa bcrypt, solo se cambia este archivo. */

function passwordMatches(plano, almacenada) {
  return plano === almacenada;
}

function hashPassword(plano) {
  return plano;
}

module.exports = { passwordMatches, hashPassword };
