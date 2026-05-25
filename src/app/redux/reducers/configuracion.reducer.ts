import { createReducer, on } from '@ngrx/store';
import { getCookie } from 'typescript-cookie';
import { cookieKey } from '../../core/domain/enums/cookie-key.enum';
import { Configuracion } from '../../modules/configuracion/types/configuracion.types';
import {
  configuracionActionInit,
  configuracionActualizacionAction,
  configuracionActualizacionDireccionOrigenAction,
  configuracionLimpiarAction,
} from '../actions/configuracion/configuracion.actions';

let datosConfiguracion = getCookie(cookieKey.CONFIGURACION);

let estadoInicializado: Configuracion = {
  id: 0,
  empresa: 0,
  informacion_factura: null,
  informacion_factura_superior: null,
  rut_sincronizar_complemento: false,
  rut_rutear_franja: false,
  rut_direccion_origen: '',
  rut_longitud: '',
  rut_latitud: '',
  rut_decodificar_direcciones: true,
  rut_hora_inicio: '07:00',
  rut_whatsapp_habilitado: false,
  rut_whatsapp_plantilla_despacho: null,
  rut_whatsapp_plantilla_idioma: 'es',
  rut_estrategia_ruteo: 'balanceado',
  rut_cita_tipo_defecto: 'obligatoria',
  rut_alerta_parada_activa: false,
  rut_alerta_parada_minutos: 15,
  rut_alerta_parada_radio_metros: 80,
  rut_alerta_geocerca_activa: false,
  rut_limite_complemento: 1000,
  rut_limite_importacion: 500,
  rut_alertas_intervalo_segundos: 30,
};

const initialState: Configuracion = datosConfiguracion
  ? JSON.parse(datosConfiguracion)
  : estadoInicializado;

export const configuracionReducer = createReducer(
  initialState,
  on(configuracionActionInit, (state, { configuracion }) => ({
    ...state,
    ...configuracion,
  })),
  on(configuracionActualizacionAction, (state, { configuracion }) => ({
    ...state,
    ...configuracion,
  })),
  on(
    configuracionActualizacionDireccionOrigenAction,
    (state, { rut_direccion_origen, rut_latitud, rut_longitud }) => ({
      ...state,
      ...{
        rut_direccion_origen,
        rut_latitud,
        rut_longitud,
      },
    })
  ),
  on(configuracionLimpiarAction, (state) => ({
    ...state,
    ...estadoInicializado,
  }))
);
