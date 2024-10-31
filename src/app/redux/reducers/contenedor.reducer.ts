import { createReducer, on } from '@ngrx/store';
import { getCookie } from 'typescript-cookie';
import { Contenedor } from '../../interfaces/contenedor/contenedor.interface';
import {
  ContenedorActionBorrarInformacion,
  ContenedorActionInit,
  ContenedorSeleccionAction,
} from '../actions/contenedor/contenedor.actions';

let contenedorDatos: string = getCookie('contenedor');
let estadoInicializado: Contenedor = {
  nombre: '',
  imagen: '',
  contenedor_id: 0,
  id: null,
  subdominio: '',
  usuario_id: 0,
  seleccion: false,
  rol: '',
  plan_id: null,
  plan_nombre: null,
  usuarios: 1,
  usuarios_base: 0,
  acceso_restringido: false,
  reddoc: false,
  ruteo: true,
};

export const initialState: Contenedor = contenedorDatos
  ? JSON.parse(contenedorDatos)
  : estadoInicializado;

export const contenedorReducer = createReducer(
  initialState,
  on(ContenedorActionInit, (state, { contenedor }) => {
    return {
      ...state,
      ...contenedor,
    };
  }),
  on(ContenedorSeleccionAction, (state, { seleccion }) => {
    return {
      ...state,
      seleccion: seleccion,
    };
  }),
  on(ContenedorActionBorrarInformacion, (state) => {
    return {
      ...state,
      ...estadoInicializado,
    };
  })
);
