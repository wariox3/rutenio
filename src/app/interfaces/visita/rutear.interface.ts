export interface VisitaResumen {
  resumen: {
    cantidad: number;
    peso: number;
  };
  errores: {
    cantidad: number;
  };
  alertas: {
    cantidad: number;
  };
}

export interface ParametrosDireccionAlternativa {
  id: number;
  latitud: number;
  longitud: number;
  destinatario_direccion_formato: string;
}

export interface ParametrosActualizarDireccion {
  id: number;
  destinatario_direccion: string;
  numero: number;
  documento: string;
  destinatario: string;
  destinatario_telefono: string;
  destinatario_correo: string;
  peso: number;
  volumen: number;
}

// id: this.visita?.id,
// destinatario_direccion: this.visita?.destinatario_direccion,
// numero: this.visita?.numero,
//       documento: this.visita?.documento,
//       destinatario: this.visita?.destinatario,
//       destinatario_correo: this.visita?.destinatario_correo,
//       destinatario_telefono: this.visita?.destinatario_telefono,
//       peso: this.visita?.peso,
//       volumen: this.visita?.volumen,
