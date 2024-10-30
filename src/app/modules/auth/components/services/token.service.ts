import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { getCookie, removeCookie, setCookie } from 'typescript-cookie';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  guardar(token:string, calcularTiempo:Date){
    setCookie('token', token, {expires: calcularTiempo,
      path: '/'})
  }

  obtener(){
    const token = getCookie('token')
    return token
  }

  eliminar() {
    removeCookie('token', {path: '/'})
  }

  refrescar(){
    
  }

  validarToken(){
    const token = this.obtener()
    if(!token){
      return false
    }
    const tokenDecodificado = jwtDecode(token);
    if (tokenDecodificado && tokenDecodificado?.exp) {
      const tokenFecha = new Date(0);
      const fechaActual = new Date();
      tokenFecha.setUTCSeconds(tokenDecodificado.exp);

      return tokenFecha.getTime() > fechaActual.getTime();
    }
    return false;
  }
  

}
