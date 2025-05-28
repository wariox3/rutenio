// Interface base para las propiedades comunes
interface BaseContenedor {
  id: number;
  subdominio: string;
  nombre: string;
  imagen: string;
  reddoc: boolean;
  ruteo: boolean;
  plan_id: number;
  plan_nombre: string;
}

// Interface base para las propiedades de usuario y acceso
interface BaseUsuarioAcceso {
  usuario_id: number;
  acceso_restringido: boolean;
}

// Interface base para las propiedades relacionadas con el plan de usuarios
interface BasePlanUsuarios {
  usuarios_base: number;
  usuarios?: number;
}

// Interfaces específicas
export interface Contenedor extends BaseContenedor, BaseUsuarioAcceso, BasePlanUsuarios {
  contenedor_id: number;
  rol: string;
  seleccion?: boolean;
}

export interface ContenedorDetalle extends BaseContenedor, BaseUsuarioAcceso {
  plan_usuarios_base: number;
  plan_limite_usuarios: number;
}

export interface ContenedorLista extends Contenedor {}

export interface ContenedorNuevo extends Contenedor {}

export interface ContenedorFormulario {
  subdominio: string;
  nombre: string;
  plan_id: number;
  correo: string;
  telefono: string;
  reddoc: boolean;
  ruteo: boolean;
  usuario_id: string;
}

export interface ListaContenedoresRespuesta {
  contenedores: Contenedor[];
}

export interface NuevoContenedorRespuesta {
  contenedor: ContenedorNuevo
}