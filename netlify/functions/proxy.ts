import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const BACKEND_URL = "http://consumer-administration-dev-alb-46504817.us-east-1.elb.amazonaws.com";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Solo permitir ciertos métodos
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
  
  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Obtener la ruta del query string
    const path = event.queryStringParameters?.path || "";
    const url = `${BACKEND_URL}${path}`;

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

    // Hacer la petición al backend
    const fetchOptions: RequestInit = {
      method: event.httpMethod,
      headers,
    };

    // Agregar body para POST/PUT
    if (event.body && (event.httpMethod === "POST" || event.httpMethod === "PUT")) {
      fetchOptions.body = event.body;
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.text();

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
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Error en el proxy", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
    };
  }
};

