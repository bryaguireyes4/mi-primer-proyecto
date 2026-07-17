const { Router } = require('express');
const {
  listarDeudas,
  crearDeuda,
  actualizarDeuda,
  eliminarDeuda,
  obtenerRecomendacion,
} = require('../controladores/deudas.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/recomendacion', obtenerRecomendacion);
router.get('/', listarDeudas);
router.post('/', crearDeuda);
router.patch('/:id', actualizarDeuda);
router.delete('/:id', eliminarDeuda);

module.exports = router;
