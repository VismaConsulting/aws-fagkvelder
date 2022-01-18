import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { deleteSertifisering } from "../api";
import AWSLogo from "../assets/aws-logo.png";

export default function Sertifisering({ sertifisering }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        image={sertifisering.bilde ? sertifisering.bilde : AWSLogo}
        alt="random"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="h5"
          component="h2"
          align="center"
          sx={{ marginBottom: 3 }}
        >
          {sertifisering.tittel}
        </Typography>
        <Typography align="center">ID: {sertifisering.id}</Typography>
        <Typography align="center">Status: {sertifisering.status}</Typography>
        <Typography align="center">Dato: {sertifisering.dato}</Typography>
        <Typography align="center">
          Gyldig til: {sertifisering.gyldig_til}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => deleteSertifisering(sertifisering.id)}
        >
          Slett
        </Button>
      </CardActions>
    </Card>
  );
}
