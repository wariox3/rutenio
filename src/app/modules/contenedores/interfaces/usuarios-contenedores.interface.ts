export interface RespuestaConsultaContenedor {
    usuarios: Usuario[]
  }
  
  export interface Usuario {
    id: number
    contenedor_id: number
    usuario_id: number
    rol: string
    username: string
  }
  
  export interface ContenedorInvitacionLista {
    id: number,
    usuario: number,
    usuario__nombre: string,
    usuario__username: string,
    contenedor: number,
    rol: string,
    tiene_acceso_web?: boolean,
    tiene_acceso_movil?: boolean,
    perfil_web?: 'operativo' | 'supervisor' | 'consulta' | null,
    perfil_movil?: 'conductor' | 'coordinador' | null,
}