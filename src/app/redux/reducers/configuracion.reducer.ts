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
  gen_uvt: '',
  gen_emitir_automaticamente: false,
  hum_factor: '',
  hum_salario_minimo: '',
  hum_auxilio_transporte: '',
  hum_entidad_riesgo: null,
  pos_documento_tipo: 0,
  rut_sincronizar_complemento: false,
  rut_rutear_franja: false,
  rut_direccion_origen: '',
  rut_longitud: '',
  rut_latitud: '',
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
