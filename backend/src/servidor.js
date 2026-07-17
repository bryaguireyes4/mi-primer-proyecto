const app = require('./aplicacion');
const entorno = require('./configuracion/entorno');

app.listen(entorno.puerto, () => {
  console.log(`API de finanzas del hogar escuchando en el puerto ${entorno.puerto}`);
});
