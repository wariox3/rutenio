import { createReducer, on } from '@ngrx/store';
import { getCookie } from 'typescript-cookie';
import { cookieKey } from '../../core/domain/enums/cookie-key.enum';
import { Empresa } from '../actions/contenedor/empresa.interface';
import { empresaActionInit, empresaActualizacionAction, empresaActualizacionAsisteneElectronico, empresaActualizacionAsistenePredeterminado, empresaActualizacionImangenAction, empresaActualizacionRededocIdAction, empresaLimpiarAction } from '../actions/empresa/empresa.actions';

let datosEmpresa = getCookie(cookieKey.EMPRESA);

let estadoInicializado: Empresa = {
  id: 0,
  numero_identificacion: '',
  digito_verificacion: '',
  nombre_corto: '',
  direccion: '',
  telefono: '',
  correo: '',
  imagen: '',
  ciudad_id: 0,
  identificacion_id: 0,
  identificacion_nombre: '',
  regimen_id: 0,
  regimen_nombre: '',
  tipo_persona_id: 0,
  tipo_persona_nombre: '',
  suscriptor: 0,
  rededoc_id: '',
  ciudad_nombre: '',
  asistente_electronico: false,
  asistente_predeterminado: false,
};

const initialState: Empresa = datosEmpresa
  ? JSON.parse(datosEmpresa)
  : estadoInicializado;

export const empresaReducer = createReducer(
  initialState,
  on(empresaActionInit, (state, { empresa }) => ({
    ...state,
    ...empresa,
  })),
  on(empresaActualizacionAction, (state, { empresa }) => ({
    ...state,
    ...empresa,
  })),
  on(empresaActualizacionImangenAction, (state, { imagen }) => ({
    ...state,
    ...{
      imagen,
    },
  })),
  on(empresaLimpiarAction, (state) => ({
    ...state,
    ...estadoInicializado,
  })),
  on(empresaActualizacionRededocIdAction, (state, { rededoc_id }) => ({
    ...state,
    ...{
      rededoc_id,
    },
  })),
  on(
    empresaActualizacionAsisteneElectronico,
    (state, { asistente_electronico }) => ({
      ...state,
      ...{
        asistente_electronico,
      },
    }),
  ),
  on(
    empresaActualizacionAsistenePredeterminado,
    (state, { asistente_predeterminado }) => ({
      ...state,
      ...{
        asistente_predeterminado,
      },
    }),
  ),
);
