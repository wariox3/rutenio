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
    rol: string
}