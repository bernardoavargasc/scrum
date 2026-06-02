const Rol = require('../models/rol.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  res.json(await Rol.listar());
});
