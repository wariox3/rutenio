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