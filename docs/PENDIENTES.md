# Pendientes

## Datos del negocio (no inventar: pedir al cliente)
- [ ] Dirección exacta → texto en Contacto + enlace “Cómo llegar” a Google Maps + `streetAddress` y `geo` en el JSON-LD.
- [ ] Horario de atención → en Contacto y `openingHours` en el JSON-LD.
- [ ] Presentaciones de pechuga (entera, filete, con o sin hueso).
- [ ] Formas de pago, entregas a domicilio o retiro, cobertura y pedido mínimo (sección “Cómo pedir”).
- [ ] Historia o trayectoria del negocio (sección “Nosotros”), solo con datos confirmados.

## Fotos reales
- [ ] Galería: fachada o local, exhibición o refrigeración, un despacho, equipo (con permiso). Activarla en `index.html` quitando `hidden` de `#galeria`, reemplazando cada `<figure>` y activando el enlace del menú.
- [ ] Idealmente, reemplazar las fotos referenciales del catálogo por fotos reales del producto.

## Publicación
- [ ] Guardar en GitHub (Settings → Secrets and variables → Actions) `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`, y relanzar el flujo “Publicar en Cloudflare Pages”. O publicar a mano según `docs/PUBLICAR.md`.
- [ ] Confirmar que el dominio es exactamente `boacgro.com`.
- [ ] Probar la vista previa al compartir el enlace por WhatsApp y Facebook.

## Técnico (opcional)
- [ ] Accesibilidad: el video no tiene pausa (WCAG 2.2.2). Reconsiderar un botón discreto si se busca cumplimiento.
- [ ] Modo oscuro: no implementado (la marca es clara).
