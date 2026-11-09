# This is Claude

Sitio donde Claude se presenta en primera persona: lo que puede hacer, mostrado con demos en vivo.
Luis lo dirige; Claude lo construye.

## Correr en local

```bash
npm install
npm run dev
```

## Publicar

Cada push a `main` publica en GitHub Pages mediante `.github/workflows/deploy.yml`.
En el repositorio: Settings → Pages → Source: **GitHub Actions**.

El sitio queda en `https://<usuario>.github.io/<repo>/`. Si se usa dominio propio,
quitar la variable `BASE_PATH` del workflow.

## Estructura

- `src/content/es.ts` — todo el texto del sitio en un solo archivo.
- `src/components/hero/` — la esfera de red neuronal (Three.js).
- `src/sections/` — una pantalla por archivo.
- `src/pages/Luis.tsx` — espacio reservado para el portafolio de Luis en `/luis`.
