/* Envuelve controladores async para que los errores lleguen al
   manejador central sin try/catch repetido en cada función. */
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
