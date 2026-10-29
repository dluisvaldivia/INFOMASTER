# DESIGN — Infomaster Formación

Dirección: **editorial suizo**. La web habla el mismo idioma que el logo: cuadrados
rectos, girados, rojo y amarillo sobre crema.

## Reglas
- **Radio 0** en todo el sitio. Única excepción: `src/components/chat/` (lo redondo y la
  aurora son la señal «esto es IA»).
- **Filetes, no tarjetas.** Secciones separadas por 1px `ink` (`SectionHeading`); listas como
  filas de tabla con `divide-line`. Rejillas de bordes compartidos para logos y datos.
- **Sin sombras.** Hover = fondo plano (`cream-deep`) o inversión tinta/crema.
- **El cuadrado es el único ornamento** (`ui/Square.tsx`): `Square` para viñetas, nav
  activa y comillas; `SquareTrio` (geometría exacta del logo) para el titular del hero y
  el footer. Ángulos permitidos: 0°, 18°, −10°, 24°.
- **Movimiento:** un solo gesto — el trío del hero entra girando hasta su ángulo.
- **Tipografía:** Archivo. Titulares a `font-stretch` 112–125 %, tracking negativo;
  cuerpo a 100 %. `tabular-nums` en fechas, horas y precios. Display máx. 6rem.
- **Color:** rojo = acción; amarillo = resaltado (chips, iniciales, selección de texto).
  Texto rojo sobre crema siempre `brand-red-deep`; sobre amarillo siempre `ink`.
- **No usar:** eyebrows encima de titulares, numeración 01/02 de secciones, sombras
  duras desplazadas, `rounded-*` fuera del chat.
