import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Sertifisering from "./components/Sertifisering";
import Addsertification from "./components/LeggTilSkjema";
import { getSertifiseringer } from "./api";
import logo from "./assets/logo.png";
import "./App.css";

const theme = createTheme();

export default function App() {
  let [sertifiseringer, setSertifiseringer] = useState([]);

  useEffect(() => {
    (async () => {
      const sertifiseringer = await getSertifiseringer();
      setSertifiseringer(sertifiseringer);
    })();
  }, [sertifiseringer]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="relative">
        <Toolbar>
          <img src={logo} className="App-logo" alt="logo" />
          <Typography variant="h5" color="inherit" noWrap>
            Mine sertifiseringer
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Mine sertifiseringer
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              Samle alle sertifiseringene dine på ett sted. Legg til ny, rediger
              og fjern sertifiseringene dine en på enkel måte.
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Addsertification />
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Grid container spacing={4}>
            {sertifiseringer.length > 0 ? (
              sertifiseringer.map((sert) => (
                <Grid item key={sert.id} xs={12} sm={6} md={4}>
                  <Sertifisering sertifisering={sert} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h5" align="center">
                  Ingen sertifiseringer ble lagt til.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>
      </main>
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Visma Consulting | AWS faggruppe | Serverløs
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
