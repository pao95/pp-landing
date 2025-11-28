# Variables de Entorno

## Configuración Local (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Base URL del backend
VITE_BASE_URL=http://consumer-administration-dev-alb-46504817.us-east-1.elb.amazonaws.com

# URL de redirección del proveedor
VITE_PROVIDER_REDIRECTION_URL=https://tu-frontend-url.com

# Usar proxy de Netlify para evitar mixed content (true/false)
# En producción (Netlify): true
# En desarrollo local: false
VITE_USE_PROXY=false
```

## Configuración en Netlify

En Netlify, configura las siguientes variables de entorno en:
**Site configuration** → **Environment variables**

```env
VITE_BASE_URL=http://consumer-administration-dev-alb-46504817.us-east-1.elb.amazonaws.com
VITE_PROVIDER_REDIRECTION_URL=https://tu-frontend-url.com
VITE_USE_PROXY=true
```

**IMPORTANTE:** 
- En Netlify, `VITE_USE_PROXY` debe ser `true` para usar el proxy y evitar errores de Mixed Content
- En desarrollo local, `VITE_USE_PROXY` debe ser `false` para llamar directamente al backend

## ¿Por qué usar el proxy?

Netlify despliega sitios en HTTPS automáticamente, pero el backend está en HTTP. Los navegadores bloquean peticiones HTTP desde sitios HTTPS (Mixed Content). 

El proxy de Netlify Functions resuelve esto:
1. El navegador hace peticiones HTTPS a `/.netlify/functions/proxy`
2. La función de Netlify hace peticiones HTTP al backend
3. El navegador recibe la respuesta vía HTTPS

