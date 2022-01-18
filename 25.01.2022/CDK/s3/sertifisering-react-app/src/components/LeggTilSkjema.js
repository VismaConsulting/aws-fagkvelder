import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { putBilde, putSertifisering } from "../api";

export default function AddCertification({setNyesteSertifisering}) {
  const [open, setOpen] = React.useState(false);
  const [fileInput, setFileInput] = React.useState(null);

  const visSkjema = () => {
    setOpen(true);
  };

  const lukkSkjema = () => {
    resetSkjema();
    setOpen(false);
  };

  const [inputVerdier, setInputVerdier] = useState({
    id: "",
    tittel: "",
    bilde: "",
    status: "",
    dato: "",
    gyldig_til: "",
  });

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setInputVerdier({ ...inputVerdier, [name]: value });
  };

  const handleOnFileChange = (event) => {
    const { files } = event.target;
    setFileInput(files[0]);
  };

  const resetSkjema = () => {
    setInputVerdier({
      id: "",
      tittel: "",
      bilde: "",
      status: "",
      dato: "",
      gyldig_til: "",
    });

    setFileInput(null);
  };

  const leggTilSertifisering = () => {
    fileInput
      ? putBilde(fileInput).then((res) => {
          let payload = { ...inputVerdier };
          payload.bilde = res.body.objectUrl;
          putSertifisering(payload).then((res) => {
            lukkSkjema(); 
            setNyesteSertifisering(inputVerdier.id)
          });
        })
      : putSertifisering(inputVerdier).then((res) => {
        lukkSkjema(); 
        setNyesteSertifisering(inputVerdier.id)
      });
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={visSkjema}>
        Legg til sertifisering
      </Button>
      <Dialog
        open={open}
        onClose={lukkSkjema}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          Legg til sertifisering
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            For å legge til en sertifisering, fyll inn tittel, status, dato og
            hvor lenge sertifiseringen vil være gyldig.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="id"
            name="id"
            label="ID"
            type="text"
            fullWidth
            onChange={handleOnChange}
          />
          <TextField
            margin="dense"
            id="tittel"
            name="tittel"
            label="Tittel"
            type="text"
            fullWidth
            onChange={handleOnChange}
          />

          <TextField
            margin="dense"
            id="bilde"
            name="bilde"
            label="Bilde"
            type="file"
            fullWidth
            onChange={handleOnFileChange}
          />

          <TextField
            margin="dense"
            id="status"
            name="status"
            label="Status"
            type="text"
            fullWidth
            onChange={handleOnChange}
          />
          <TextField
            margin="dense"
            id="dato"
            name="dato"
            label="Dato"
            type="text"
            fullWidth
            onChange={handleOnChange}
          />
          <TextField
            margin="dense"
            id="gyldig_til"
            name="gyldig_til"
            label="Gyldig til"
            type="text"
            fullWidth
            onChange={handleOnChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={lukkSkjema} color="primary">
            Avbryt
          </Button>
          <Button onClick={leggTilSertifisering} color="primary">
            Legg til
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
