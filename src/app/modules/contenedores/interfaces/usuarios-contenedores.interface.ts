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
  