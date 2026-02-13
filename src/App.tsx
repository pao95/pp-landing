import { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  TextField,
} from "@mui/material";
import axios from "axios";
import "./App.css";
import { BASE_URL, PROVIDER_REDIRECTION_URL } from "./config";

const TOKEN_ENDPOINT = `${BASE_URL}/user-service/api/v1/external/generate-token`;
const LOAN_EVALUATION_ENDPOINT = `${BASE_URL}/landing-service/api/v1/loan-evaluation`;

/** ID Onscore fijo para este comercio; se muestra en pantalla y se envía siempre en la evaluación. */
const ID_ONSCORE_COMERCIO = "000000998159";

function App() {
  const [isSecondButtonEnabled, setIsSecondButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [token, setToken] = useState<string>("");
  const [dni, setDni] = useState<string>("12345678");
  const [cuil, setCuil] = useState<string>("20123456779");
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [loanData, setLoanData] = useState<{
    loanApplicationId: string;
    dni: string;
    preApprovedAmount: number;
    token: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const handleGenerateToken = async () => {
    setTokenError(null);
    setIsGeneratingToken(true);
    try {
      const response = await axios.get(TOKEN_ENDPOINT, {
        headers: {
          "X-Request-ID": "1",
        },
      });

      if (response.data && response.data.token) {
        setToken(response.data.token);
        console.log("Token generado exitosamente");
      } else {
        setTokenError("No se recibió un token válido del servidor");
      }
    } catch (err: any) {
      console.error("Error generando token:", err);
      if (axios.isAxiosError(err)) {
        setTokenError(
          `Error: ${err.response?.status} - ${err.response?.statusText || err.message
          }`
        );
      } else {
        setTokenError("Error al generar el token firmado");
      }
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleFirstButtonClick = async () => {
    if (!token) {
      setError("Por favor, genera el token firmado primero");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(
        LOAN_EVALUATION_ENDPOINT,
        {
          dni: dni,
          cuil: cuil,
          genero: "M",
          fecha_nacimiento: "1990-01-15",
          nombre: nombre,
          apellido: apellido,
          id_sucursal: "001",
          dni_usuario: "34437311",
          id_onscore: ID_ONSCORE_COMERCIO,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": "1",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: false,
        }
      );
      console.log(response.data);
      setTimeout(() => {
        setLoanData(response.data);
        setIsSecondButtonEnabled(true);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("Error fetching loan data:", err.response?.data);

      setError(
        `Error: ${err.response?.data?.message || err.response?.data?.detail}`
      );

      setLoanData(null);
      setIsSecondButtonEnabled(false);
      setIsLoading(false);
    }
  };

  const handleSecondButtonClick = () => {
    if (!token) {
      setError("Token no disponible");
      return;
    }

    if (loanData) {
      console.log(loanData);
      const url = `${PROVIDER_REDIRECTION_URL}/new-loan?applicationId=${loanData.loanApplicationId}&token=${token}`;

      window.open(url, "_blank");
    }
  };

  return (
    <Container
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "#222" }}
        >
          RapiCompras
        </Typography>

        <Box display="flex" flexDirection="row" gap={2}>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            size="small"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresa el nombre"
            sx={{ mt: 2 }}
          />

          <TextField
            label="Apellido"
            variant="outlined"
            fullWidth
            size="small"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Ingresa el apellido"
            sx={{ mt: 2 }}
          />
        </Box>

        <Box display="flex" flexDirection="row" gap={2}>
          <TextField
            label="DNI"
            variant="outlined"
            fullWidth
            size="small"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Ingresa el DNI"
            sx={{ mt: 2 }}
          />

          <TextField
            label="CUIL"
            variant="outlined"
            fullWidth
            size="small"
            value={cuil}
            onChange={(e) => setCuil(e.target.value)}
            placeholder="Ingresa el CUIL"
            sx={{ mt: 2 }}
          />
        </Box>




        <Paper
          elevation={3}
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#e0e0e0",
            color: "#424242",
            width: "100%",
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            Comercio
          </Typography>
          <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
            {ID_ONSCORE_COMERCIO}
          </Typography>
        </Paper>

        <Button
          variant="contained"
          color="success"
          onClick={handleGenerateToken}
          fullWidth
          disabled={isGeneratingToken}
        >
          {isGeneratingToken ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Generar Token Firmado"
          )}
        </Button>

        {token && (
          <Paper
            elevation={3}
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#e8f5e9",
              color: "#1b5e20",
              width: "100%",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              Token generado exitosamente
            </Typography>
            <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
              {token.slice(0, 50)}...
            </Typography>
          </Paper>
        )}

        {tokenError && (
          <Paper
            elevation={3}
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#ffebee",
              color: "#b71c1c",
              width: "100%",
            }}
          >
            <Typography variant="body1">{tokenError}</Typography>
          </Paper>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleFirstButtonClick}
          fullWidth
          disabled={isLoading || !token}
        // sx={{ height: 50, fontWeight: 600, fontSize: 18, mt: 2 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Obtener oferta"
          )}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleSecondButtonClick}
          disabled={!isSecondButtonEnabled}
          fullWidth
        >
          Continuar con la solicitud
        </Button>

        {error && (
          <Paper
            elevation={3}
            sx={{
              mt: 2,
              p: 2,
              mb: 2,
              bgcolor: "#ffebee",
              color: "#b71c1c",
              width: "100%",
            }}
          >
            <Typography variant="body1">{error}</Typography>
          </Paper>
        )}

        {isLoading && (
          <Paper
            elevation={4}
            sx={{
              mt: 3,
              p: 3,
              bgcolor: "#e3f2fd",
              width: "100%",
              textAlign: "center",
            }}
          >
            <CircularProgress size={30} sx={{ color: "#1976d2" }} />
            <Typography variant="body1" sx={{ mt: 2, color: "#1976d2" }}>
              Procesando solicitud...
            </Typography>
          </Paper>
        )}

        {loanData && (
          <Paper
            elevation={4}
            sx={{ mt: 3, p: 3, bgcolor: "#222", color: "#fff", width: "100%" }}
          >
            <Typography variant="h6" sx={{ color: "#90caf9" }}>
              Loan Details
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1">
                <b>Application ID:</b> {loanData.loanApplicationId}
              </Typography>
              <Typography variant="body1">
                <b>Pre-approved Amount:</b> $
                {loanData.preApprovedAmount.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;
