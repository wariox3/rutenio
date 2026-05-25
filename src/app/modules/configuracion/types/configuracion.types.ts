export interface Configuracion {
  id: number;
  empresa: number;
  informacion_factura: any;
  informacion_factura_superior: any;
  rut_sincronizar_complemento: boolean;
  rut_rutear_franja: boolean;
  rut_direccion_origen: string;
  rut_latitud: string;
  rut_longitud: string;
  rut_decodificar_direcciones: boolean;
  rut_hora_inicio: string;
  rut_whatsapp_habilitado: boolean;
  rut_whatsapp_plantilla_despacho: string | null;
  rut_whatsapp_plantilla_idioma: string;
  rut_estrategia_ruteo: string;
  rut_cita_tipo_defecto: string;
  rut_alerta_parada_activa: boolean;
  rut_alerta_parada_minutos: number;
  rut_alerta_parada_radio_metros: number;
  rut_alerta_geocerca_activa: boolean;
  rut_limite_complemento: number;
  rut_limite_importacion: number;
  rut_alertas_intervalo_segundos: number;
}
