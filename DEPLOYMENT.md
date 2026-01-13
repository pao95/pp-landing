# Guía de Deployment con Proxy para Mixed Content

## Problema

Netlify despliega sitios en **HTTPS automáticamente** y NO permite HTTP. El backend está en HTTP, lo que causa errores de "Mixed Content" cuando el navegador intenta hacer peticiones HTTP desde un sitio HTTPS.

## Solución: Netlify Functions como Proxy

Hemos implementado una Netlify Function que actúa como proxy para hacer las peticiones al backend HTTP desde el servidor (no desde el navegador).

---

## 📋 Pasos para Deployar

### 1. Instalar dependencias

```bash
cd landing
npm install
```

### 2. Configurar Variables de Entorno en Netlify

Ve a tu proyecto en Netlify:

1. **Site configuration** → **Environment variables**
2. Agrega las siguientes variables:

```
VITE_BASE_URL=https://consumer-api-dev.sucuaccicom.com.ar
VITE_PROVIDER_REDIRECTION_URL=https://tu-frontend-url.com
VITE_USE_PROXY=true
```

**⚠️ IMPORTANTE:** `VITE_USE_PROXY` debe ser `true` en Netlify

### 3. Verificar archivos creados

Asegúrate de que existen estos archivos:

- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `netlify/functions/proxy.ts` - Función proxy
- ✅ `ENV.md` - Documentación de variables

### 4. Deploy

```bash
npm run build
```

Luego pushea a tu repositorio o despliega directamente desde Netlify.

---

## 🧪 Desarrollo Local

Para desarrollo local, crea un archivo `.env.local`:

```env
VITE_BASE_URL=https://consumer-api-dev.sucuaccicom.com.ar
VITE_PROVIDER_REDIRECTION_URL=http://localhost:5173
VITE_USE_PROXY=false
```

**⚠️ En local:** `VITE_USE_PROXY` debe ser `false` para llamar directamente al backend

Luego ejecuta:

```bash
npm run dev
```

---

## 🔄 Cómo funciona el Proxy

### Flujo con Proxy (Producción en Netlify)

```
Navegador (HTTPS)
    → /.netlify/functions/proxy (HTTPS)
        → Backend HTTP
            → Respuesta
```

### Flujo sin Proxy (Desarrollo Local)

```
Navegador (HTTP)
    → Backend HTTP directo
        → Respuesta
```

---

## 📝 Archivos Modificados

1. **`src/App.tsx`**

   - Detecta si usar proxy con `USE_PROXY`
   - Redirige peticiones a `/.netlify/functions/proxy` cuando está habilitado

2. **`src/config/index.ts`**

   - Exporta `USE_PROXY` desde variables de entorno

3. **`netlify/functions/proxy.ts`**

   - Función serverless que hace las peticiones al backend HTTP

4. **`netlify.toml`**

   - Configuración de build y functions

5. **`package.json`**
   - Agregada dependencia `@netlify/functions`

---

## 🚨 Solución Definitiva (Recomendado)

La solución con proxy es **temporal**. La solución correcta es:

1. Configurar **HTTPS en el ALB de AWS**
2. Obtener certificado SSL gratuito con AWS Certificate Manager (ACM)
3. Cambiar `VITE_BASE_URL` a HTTPS en Netlify
4. Cambiar `VITE_USE_PROXY` a `false`

---

## ❓ Troubleshooting

### El proxy no funciona

- Verifica que `VITE_USE_PROXY=true` en Netlify
- Verifica que el archivo `netlify.toml` esté en la raíz
- Revisa los logs de Netlify Functions

### Error "Function not found"

- Asegúrate de que la carpeta `netlify/functions` exista
- Verifica que `@netlify/functions` esté instalado
- Redeploy el sitio

### CORS errors

- El proxy maneja CORS automáticamente
- Si aún hay errores, revisa la configuración del backend
