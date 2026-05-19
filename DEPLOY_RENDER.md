# Despliegue del Frontend en Render (Docker)

Repositorio: `trycore-evm-frontend`

## Requisitos previos

- API ya desplegado en Render (ver `DEPLOY_RENDER.md` del repo API)
- URL del API, por ejemplo: `https://trycore-evm-api.onrender.com/api`

## Paso 1: Crear Web Service del frontend

1. En Render → **New +** → **Web Service**
2. Conectar el repo `trycore-evm-frontend`
3. Configuración:
   - **Name:** `trycore-evm-frontend`
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance type:** Free

## Paso 2: Variable de entorno

| Variable | Valor |
|----------|--------|
| `API_URL` | `https://TU-API.onrender.com/api` (URL real de tu API + `/api`) |

El contenedor genera `assets/config/env.js` al arrancar con esa URL.

## Paso 3: Desplegar

1. **Create Web Service**
2. Cuando termine, abre: `https://trycore-evm-frontend.onrender.com`

## Paso 4: Actualizar CORS en el API

En el servicio del **API** en Render, edita:

```
CORS_ORIGINS=https://trycore-evm-frontend.onrender.com
```

Guarda y espera el redeploy del API.

## Paso 5: Verificación

1. Abre el frontend en el navegador
2. Crea un proyecto desde el botón flotante (+)
3. Selecciona el proyecto en el dropdown
4. Agrega actividades y revisa tabla + gráfico

## Build local del Docker (opcional)

```bash
docker build -t trycore-evm-frontend .
docker run -p 8080:8080 -e API_URL=https://TU-API.onrender.com/api trycore-evm-frontend
```

Abre `http://localhost:8080`
