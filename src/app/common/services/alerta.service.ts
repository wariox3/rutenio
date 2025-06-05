import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  constructor() {}

    private getBaseConfig() {
    return {
      customClass: {
        container: '!font-sans !overflow-hidden',
        popup: '!rounded-lg !shadow-xl !py-2 !px-4',
        title: '!text-lg !font-bold !text-gray-800 !overflow-hidden',
        closeButton: '!text-gray-400 hover:!text-gray-600',
        icon: '!mx-auto !mb-4',
        content: '!text-gray-600',
        input: '!mt-2 !border !border-gray-300 !rounded !px-3 !py-2 focus:!outline-none focus:!ring-2 focus:!ring-blue-500',
        actions: '!mt-6 !flex !justify-end !space-x-3',
        confirmButton: '!px-4 !py-2 !rounded !font-medium !shadow-sm',
        cancelButton: '!px-4 !py-2 !rounded !font-medium !bg-white !border !border-gray-300 !text-gray-700 !shadow-sm hover:!bg-gray-50',
        footer: '!mt-4 !text-gray-500 !text-sm'
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    };
  }

  mensajeError(title: string, text: string) {
    Swal.fire({
      ...this.getBaseConfig(),
      title,
      html: text,
      icon: 'error',
      position: 'bottom-right',
      toast: true,
      timer: 20000,
      showConfirmButton: true,
      timerProgressBar: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#d9214e',
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    });
  }

  async mensajaExitoso(text: string, titulo = 'Guardado con éxito.') {
    return await Swal.fire({
      ...this.getBaseConfig(),
      title: titulo,
      html: text,
      icon: 'success',
      position: 'bottom-right',
      toast: true,
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    });
  }

  async mensajaEspera(
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info'
  ) {
    return await (Swal.fire({
      html: text,
      icon,
      timerProgressBar: true,
      showConfirmButton: true,
      allowOutsideClick: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    }),
    Swal.showLoading());
  }

  mensajeValidacion(
    title: string,
    html: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info'
  ) {
    return Swal.fire({
      title,
      icon,
      html,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      cancelButtonText: 'Cancelar',
      cancelButtonAriaLabel: 'Thumbs down',
      confirmButtonText: 'Aceptar',
      confirmButtonAriaLabel: 'aceptar',
      confirmButtonColor: '#009EF7',
    });
  }

  async mensajeEliminarEmpresa(
    empresaNombre: string | null,
    title: string,
    html: string,
    inputLabel: string,
    confirmButtonText: string,
    cancelButtonText: string
  ) {
    const mensaje = await Swal.fire({
      title,
      icon: 'warning',
      html,
      cancelButtonText,
      confirmButtonText,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonColor: '#f1416c',
      input: 'text',
      inputLabel: `${inputLabel}${empresaNombre}`,
      didOpen: () => {
        // Deshabilitar el botón de confirmar
        Swal.getConfirmButton()?.setAttribute('disabled', 'true');
        // Configurar el foco del input
        const input = Swal.getInput();
        if (input) {
          input.focus(); // Establecer el foco en el input
          input.oninput = () => {
            if (Swal.getInput()?.value === empresaNombre) {
              Swal.getConfirmButton()?.removeAttribute('disabled');
            } else {
              Swal.getConfirmButton()?.setAttribute('disabled', 'true');
            }
          };
        }
      },
    });
    return mensaje;
  }

  cerrarMensajes() {
    return Swal.close();
  }

  mensajeVisible() {
    return Swal.isVisible();
  }

  async mensajaContactoLandinpage(text: string) {
    return await Swal.fire({
      html: text,
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    }).then(() => {
      window.location.href = '/';
    });
  }

  async confirmar({
    colorConfirmar = '#d33',
    texto,
    textoBotonCofirmacion,
    titulo,
  }: {
    titulo: string;
    texto: string;
    textoBotonCofirmacion: string;
    colorConfirmar?: string;
  }) {
    return await Swal.fire({
      title: titulo,
      icon: 'warning',
      text: texto,
      showCancelButton: true,
      confirmButtonColor: colorConfirmar,
      confirmButtonText: textoBotonCofirmacion,
      cancelButtonText: 'Cancelar',
    });
  }
}
