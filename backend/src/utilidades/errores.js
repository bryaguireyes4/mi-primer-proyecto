class ErrorAplicacion extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

module.exports = { ErrorAplicacion };
