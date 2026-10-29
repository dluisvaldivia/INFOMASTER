/**
 * Ruta a un fichero de public/ respetando la base de Vite: en GitHub Pages la
 * web vive bajo /INFOMASTER/, así que una ruta absoluta "/images/…" daría 404.
 */
export function publicUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
