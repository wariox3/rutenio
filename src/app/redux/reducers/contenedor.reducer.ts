import { createReducer, on } from '@ngrx/store';
import { getCookie } from 'typescript-cookie';
import { Contenedor } from '../../modules/contenedores/interfaces/contenedor.interface';
import {
  ContenedorActionActualizarPermisos,
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
  permisos: null,
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
  }),
  on(ContenedorActionActualizarPermisos, (state, payload) => {
    const next: any = { ...state, permisos: payload.permisos };
    if (payload.rol !== undefined) next.rol = payload.rol;
    if (payload.tiene_acceso_web !== undefined) next.tiene_acceso_web = payload.tiene_acceso_web;
    if (payload.tiene_acceso_movil !== undefined) next.tiene_acceso_movil = payload.tiene_acceso_movil;
    if (payload.perfil_movil !== undefined) next.perfil_movil = payload.perfil_movil;
    return next;
  }),
);
