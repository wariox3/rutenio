import { createReducer, on } from "@ngrx/store";
import { getCookie } from "typescript-cookie";
import { Usuario } from "../../interfaces/user/user.interface";
import { usuarioIniciar } from "../actions/auth/usuario.actions";

let usuarioData: string | undefined = getCookie("usuario");

let parsedState: Usuario = {
  id: "",
  username: "",
  cargo: "",
  imagen: "",
  nombre_corto: "",
  nombre: "",
  apellido: "",
  telefono: "",
  correo: "",
  idioma: "",
  dominio: "",
  fecha_limite_pago: new Date(),
  vr_saldo: 0,
  verificado: false,
  socio_id: null,
  is_active: false,
};

export const initialState: Usuario = usuarioData
  ? JSON.parse(usuarioData)
  : parsedState;

export const usuarioReducer = createReducer(
  initialState,
  on(usuarioIniciar, (state, { usuario }) => {
    return {
      ...state,
      ...usuario,
    };
  })
);
