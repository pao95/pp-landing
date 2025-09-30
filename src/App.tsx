import { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import "./App.css";
import { BASE_URL, PROVIDER_REDIRECTION_URL } from "./config";

function App() {
  const [isSecondButtonEnabled, setIsSecondButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loanData, setLoanData] = useState<{
    loanApplicationId: string;
    dni: string;
    preApprovedAmount: number;
    token: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFirstButtonClick = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/sales/loan-evaluation`,
        {
          dni: "12345677",
          cuil: "20123456779",
          genero: "masculino",
          fechaNacimiento: "1990-01-01",
          nombre: "Juan",
          apellido: "Pérez",
          commerceCuil: "30457203161",
          cuitComercio: "30123456789",
          idSucursal: "SUC001",
          rubro: "Electrónica",
          categoria: "A",
          cuilUsuario: "20123456789",
          idSolicitudRapicompras: "RAP123456",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": "1",
            Authorization: "Basic YWRtaW46YWRtaW4xMjM=",
            // "Access-Control-Allow-Origin": "*",
            // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            // "Access-Control-Allow-Headers":
            //   "Content-Type, Authorization, X-Request-ID",
          },
          withCredentials: false,
        }
      );

      setTimeout(() => {
        setLoanData(response.data);
        setIsSecondButtonEnabled(true);
        setIsLoading(false);
      }, 1000);
    } catch (err: unknown) {
      console.error("Error fetching loan data:", err);
      if (axios.isAxiosError(err)) {
        setError(
          `Error: ${err.response?.status} - ${err.response?.statusText}`
        );
      } else {
        setError("Error fetching loan data.");
      }
      setLoanData(null);
      setIsSecondButtonEnabled(false);
      setIsLoading(false);
    }
  };

  const handleSecondButtonClick = () => {
    if (loanData) {
      console.log(loanData);
      const url = `${PROVIDER_REDIRECTION_URL}/new-loan?applicationId=${
        loanData.loanApplicationId
      }&dni=${39089730}&token=${loanData.token}`;

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

        <Button
          variant="contained"
          color="primary"
          onClick={handleFirstButtonClick}
          fullWidth
          disabled={isLoading}
          sx={{ height: 50, fontWeight: 600, fontSize: 18 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Obtener información de la solicitud"
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
              <Typography variant="body1">
                <b>Token:</b>{" "}
                <span style={{ wordBreak: "break-all" }}>
                  {loanData.token.slice(0, 40)}...
                </span>
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;
