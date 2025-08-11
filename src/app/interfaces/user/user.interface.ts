export interface Usuario {
  id: string;
  username: string;
  cargo: string;
  imagen: string;
  nombre_corto: string;
  nombre: string;
  imagen_thumbnail: string;
  apellido: string;
  telefono: string;
  correo: string;
  idioma: string;
  dominio: string;
  fecha_limite_pago: Date;
  vr_saldo: number;
  numero_identificacion: string;
  is_active: boolean;
  socio_id: number | null;
  verificado: boolean;
}
