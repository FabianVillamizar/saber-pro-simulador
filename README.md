# Proyecto de estudio personal

Aplicación personal de práctica y repaso, construida con React + Vite.

## Correr en local

```bash
npm install
npm run dev
```

Para generar el build de producción:

```bash
npm run build
npm run preview
```

## Deploy

El deploy a GitHub Pages es automático vía GitHub Actions
(`.github/workflows/deploy.yml`): cada push a `main` construye el proyecto
y publica `dist/` en Pages. El `base` en `vite.config.js` debe coincidir
con el nombre del repo (`/saber-pro-simulador/`) o el sitio carga en blanco.
