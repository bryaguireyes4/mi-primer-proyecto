// Genera los iconos PNG de la PWA (fondo dark navy + circulo dorado) sin
// dependencias externas, usando solo el modulo zlib de Node.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const NAVY = [16, 21, 31];
const GOLD = [212, 175, 106];
const GOLD_FUERTE = [232, 200, 138];

function generarPng(tamano) {
  const centro = tamano / 2;
  const radioExterno = tamano * 0.36;
  const radioInterno = tamano * 0.14;

  const filas = [];
  for (let y = 0; y < tamano; y++) {
    const fila = Buffer.alloc(1 + tamano * 4);
    fila[0] = 0; // sin filtro
    for (let x = 0; x < tamano; x++) {
      const dx = x - centro;
      const dy = y - centro;
      const distancia = Math.sqrt(dx * dx + dy * dy);
      let color = NAVY;
      if (distancia <= radioExterno && distancia >= radioInterno) {
        const t = (distancia - radioInterno) / (radioExterno - radioInterno);
        color = t > 0.5 ? GOLD_FUERTE : GOLD;
      }
      const indice = 1 + x * 4;
      fila[indice] = color[0];
      fila[indice + 1] = color[1];
      fila[indice + 2] = color[2];
      fila[indice + 3] = 255;
    }
    filas.push(fila);
  }

  const datosCrudos = Buffer.concat(filas);
  const datosComprimidos = zlib.deflateSync(datosCrudos);

  function crearChunk(tipo, datos) {
    const longitud = Buffer.alloc(4);
    longitud.writeUInt32BE(datos.length, 0);
    const tipoBuffer = Buffer.from(tipo, 'ascii');
    const crcBuffer = Buffer.concat([tipoBuffer, datos]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(calcularCrc32(crcBuffer) >>> 0, 0);
    return Buffer.concat([longitud, tipoBuffer, datos, crc]);
  }

  function calcularCrc32(buffer) {
    let crc = 0xffffffff;
    for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i];
      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrDatos = Buffer.alloc(13);
  ihdrDatos.writeUInt32BE(tamano, 0);
  ihdrDatos.writeUInt32BE(tamano, 4);
  ihdrDatos[8] = 8; // profundidad de bits
  ihdrDatos[9] = 6; // color RGBA
  ihdrDatos[10] = 0;
  ihdrDatos[11] = 0;
  ihdrDatos[12] = 0;

  const ihdr = crearChunk('IHDR', ihdrDatos);
  const idat = crearChunk('IDAT', datosComprimidos);
  const iend = crearChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([firma, ihdr, idat, iend]);
}

const directorioPublic = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(directorioPublic, 'icono-192.png'), generarPng(192));
fs.writeFileSync(path.join(directorioPublic, 'icono-512.png'), generarPng(512));
console.log('Iconos generados en public/icono-192.png y public/icono-512.png');
