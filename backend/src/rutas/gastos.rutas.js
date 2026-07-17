const { Router } = require('express');
const {
  listarGastos,
  sugerirEtiquetaGasto,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
} = require('../controladores/gastos.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', listarGastos);
router.post('/sugerir-etiqueta', sugerirEtiquetaGasto);
router.post('/', crearGasto);
router.patch('/:id', actualizarGasto);
router.delete('/:id', eliminarGasto);

module.exports = router;
