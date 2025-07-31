import { Injectable } from '@angular/core';
import {
  ParametrosConsulta,
  RespuestaGeneralLista,
} from '../../../interfaces/general/api.interface';
import {
  AutocompletarCiudades,
  RespuestaAutocompletar,
} from '../../../interfaces/general/autocompletar.interface';
import { RespuestaContacto } from '../../../interfaces/contacto/contacto.interface';
import { HttpService } from '../../../common/services/http.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cambiarVacioPorNulo } from '../../../common/validaciones/campo-no-obligatorio.validator';
import { ParametrosApi } from '../../../core/types/api.type';

@Injectable({
  providedIn: 'root',
})
export class ContactoService {

  constructor(private http: HttpService) {}

  consultarDetalle(id: number) {
    return this.http.getDetalle<any>(`general/contacto/${id}/`);
  }



  guardarContacto(data: any) {
    return this.http.post<RespuestaContacto>(`general/contacto/`, data);
  }

  actualizaContacto(id: number, data: any) {
    return this.http.put<RespuestaContacto>(
      `general/contacto/${id}/`,
      data
    );
  }

  crearFormularioContacto() {
    return new FormGroup({
      tipo_persona: new FormControl(null, [Validators.required]),
      numero_identificacion: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^[0-9]+$/),
        ])
      ),
      digito_verificacion: new FormControl(
        null,
        Validators.compose([Validators.required, Validators.maxLength(1)])
      ),
      identificacion: new FormControl(
        null,
        Validators.compose([Validators.required])
      ),
      nombre_corto: new FormControl(
        null,
        Validators.compose([Validators.maxLength(200)])
      ),
      nombre1: new FormControl(null, [
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÑñ ]+$/),
        cambiarVacioPorNulo.validar,
      ]),
      nombre2: new FormControl(null, [
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÑñ ]+$/),
        cambiarVacioPorNulo.validar,
      ]),
      apellido1: new FormControl(null, [
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÑñ ]+$/),
        cambiarVacioPorNulo.validar,
      ]),
      apellido2: new FormControl(null, [
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÑñ ]+$/),
        cambiarVacioPorNulo.validar,
      ]),
      telefono: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[0-9]+$/),
        ])
      ),
      celular: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[0-9]+$/),
        ])
      ),
      barrio: new FormControl('', [
        Validators.maxLength(200),
        cambiarVacioPorNulo.validar,
      ]),
      correo: new FormControl('', [
        Validators.required,
        Validators.maxLength(255),
      ]),
      regimen: new FormControl(null, Validators.compose([Validators.required])),
      codigo_ciuu: new FormControl(null),
      ciudad_nombre: new FormControl(''),
      ciudad: new FormControl(null, Validators.compose([Validators.required])),
      direccion: new FormControl(
        null,
        Validators.compose([Validators.required, Validators.maxLength(50)])
      ),
      plazo_pago: new FormControl(
        null,
        Validators.compose([Validators.required])
      ),
      precio: new FormControl(''),
      asesor: new FormControl(''),
    });
  }
}
