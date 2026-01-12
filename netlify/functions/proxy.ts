import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Usar variable de entorno o valor por defecto
const BACKEND_URL =
  process.env.BACKEND_URL ||
  "http://consumer-administration-dev-alb-639243243.us-east-1.elb.amazonaws.com";

// Timeout para las peticiones (en ms)
const FETCH_TIMEOUT = 30000;

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Manejar preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Request-ID",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: "",
    };
  }

  // Solo permitir ciertos métodos
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Obtener la ruta del query string
    const path = event.queryStringParameters?.path || "";
    const url = `${BACKEND_URL}${path}`;

    console.log(`[Proxy] ${event.httpMethod} ${url}`);
    console.log(`[Proxy] BACKEND_URL: ${BACKEND_URL}`);

    // Preparar headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Copiar headers específicos del request original
    if (event.headers["x-request-id"]) {
      headers["X-Request-ID"] = event.headers["x-request-id"];
    }
    if (event.headers["authorization"]) {
      headers["Authorization"] = event.headers["authorization"];
    }

    // Hacer la petición al backend con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const fetchOptions: RequestInit = {
      method: event.httpMethod,
      headers,
      signal: controller.signal,
    };

    // Agregar body para POST/PUT
    if (
      event.body &&
      (event.httpMethod === "POST" || event.httpMethod === "PUT")
    ) {
      fetchOptions.body = event.body;
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    const data = await response.text();
    console.log(`[Proxy] Response status: ${response.status}`);

    // Intentar parsear como JSON, si falla devolver texto plano
    let responseBody;
    try {
      responseBody = JSON.parse(data);
    } catch {
      responseBody = data;
    }

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Request-ID",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body:
        typeof responseBody === "string"
          ? responseBody
          : JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error("[Proxy] Error:", error);

    let errorMessage = "Unknown error";
    let errorCode = "UNKNOWN";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Detectar errores específicos de conexión
      if (error.name === "AbortError") {
        errorCode = "TIMEOUT";
        errorMessage = `La petición excedió el tiempo límite de ${
          FETCH_TIMEOUT / 1000
        } segundos`;
      } else if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo")
      ) {
        errorCode = "DNS_ERROR";
        errorMessage = "No se pudo resolver el nombre del host del backend";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorCode = "CONNECTION_REFUSED";
        errorMessage = "La conexión al backend fue rechazada";
      } else if (
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("ENETUNREACH")
      ) {
        errorCode = "NETWORK_ERROR";
        errorMessage =
          "No se puede alcanzar el backend (posiblemente está en una red privada)";
      }
    }

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Error en el proxy",
        code: errorCode,
        details: errorMessage,
        backendUrl: BACKEND_URL,
      }),
    };
  }
};
