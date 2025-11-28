import { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Card,
  TextField,
} from "@mui/material";
import axios from "axios";
import "./App.css";
import { BASE_URL, PROVIDER_REDIRECTION_URL } from "./config";

const TOKEN_ENDPOINT = `${BASE_URL}/user-service/api/v1/external/generate-token`;

function App() {
  const [isSecondButtonEnabled, setIsSecondButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [token, setToken] = useState<string>("");
  const [cuitComercio, setCuitComercio] = useState<string>("65457203161");
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
      const response = await axios.get(
        TOKEN_ENDPOINT,
        {
          headers: {
            "X-Request-ID": "1",
          },
        }
      );
      
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
          `Error: ${err.response?.status} - ${err.response?.statusText || err.message}`
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

    if (!cuitComercio) {
      setError("Por favor, ingresa el CUIT del comercio");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/landing-service/api/v1/loan-evaluation`,
        {
          dni: "12345677",
          cuil: "54653454434",
          genero: "M",
          fechaNacimiento: "1990-01-15",
          nombre: "Juan",
          apellido: "Pérez",
          cuitComercio: cuitComercio,
          idSucursal: "001",
          rubro: "Retail",
          categoria: "Category A",
          cuilUsuario: "20987654321",
          idSolicitudRapicompras: "RC123456",
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
      console.error("Error fetching loan data:", err);

      if (err?.response?.data?.errorType === "LOAN_EVALUATION_ERROR") {
        setError(
          `Error: ${err.response?.data.status} - ${err.response?.data.detail}`
        );
      } else {
        if (axios.isAxiosError(err)) {
          setError(
            `Error: ${err.response?.status} - ${err.response?.statusText}`
          );
        } else {
          setError("Error fetching loan data.");
        }
      }

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

      window.location.href = url;
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
          Banco Macro
        </Typography>

        <Card sx={{ padding: "16px" }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Cliente
            </Typography>
            <Typography variant="body1">
              <b>Nombre:</b> Juan
            </Typography>
            <Typography variant="body1">
              <b>Apellido:</b> Pérez
            </Typography>
            <Typography variant="body1">
              <b>DNI:</b> 12345677
            </Typography>
            <Typography variant="body1">
              <b>CUIL:</b> 20123456771
            </Typography>
            <Typography variant="body1">
              <b>Género:</b> Masculino
            </Typography>
          </Box>
        </Card>

        <TextField
          label="CUIT del Comercio"
          variant="outlined"
          fullWidth
          value={cuitComercio}
          onChange={(e) => setCuitComercio(e.target.value)}
          placeholder="Ingresa el CUIT del comercio"
          sx={{ mt: 2 }}
        />

        <Button
          variant="contained"
          color="success"
          onClick={handleGenerateToken}
          fullWidth
          disabled={isGeneratingToken}
          sx={{ height: 50, fontWeight: 600, fontSize: 16, mt: 2 }}
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
          sx={{ height: 50, fontWeight: 600, fontSize: 18, mt: 2 }}
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
          sx={{ height: 50, fontWeight: 600, fontSize: 18 }}
        >
          Continuar con la solicitud
        </Button>

        {error && (
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
              {/* <Typography variant="body1">
                <b>Token:</b>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {loanData.token.slice(0, 40)}...
                </span>
              </Typography> */}
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;
