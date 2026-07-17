const { Router } = require('express');
const {
  listarCategorias,
  crearCategoria,
  eliminarCategoria,
} = require('../controladores/categorias.controlador');
const { autenticar, requerirAdmin } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', listarCategorias);
router.post('/', requerirAdmin, crearCategoria);
router.delete('/:id', requerirAdmin, eliminarCategoria);

module.exports = router;
