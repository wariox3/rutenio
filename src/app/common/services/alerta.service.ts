import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  constructor() {}

  // ========== Estilos base compartidos ==========

  /** Estilos para modales centrados (confirmación, validación, esperar). */
  private getBaseConfig() {
    return {
      buttonsStyling: false,
      customClass: {
        container: '!font-sans',
        popup:
          '!rounded-2xl !shadow-2xl !shadow-gray-900/10 !border !border-gray-100 !bg-white !p-6 !max-w-md',
        title: '!text-[17px] !font-semibold !text-gray-800 !tracking-tight !mt-3',
        htmlContainer: '!text-[14px] !text-gray-600 !leading-relaxed !mt-2',
        icon: '!mx-auto !my-2 !border-0 !w-14 !h-14',
        closeButton:
          '!w-8 !h-8 !rounded-full !text-gray-400 hover:!text-gray-700 hover:!bg-gray-100 !transition focus:!shadow-none',
        input:
          '!mt-3 !border !border-gray-200 !rounded-lg !px-3 !py-2 !text-sm focus:!outline-none focus:!ring-2 focus:!ring-blue-500/30 focus:!border-blue-500',
        inputLabel: '!text-[13px] !text-gray-600 !mt-3 !mb-1',
        validationMessage: '!bg-red-50 !text-red-700 !text-xs !rounded-lg !mt-3 !py-2 !px-3',
        actions: '!mt-5 !flex !justify-end !gap-2 !w-full',
        confirmButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !shadow-sm !transition ' +
          '!bg-blue-600 hover:!bg-blue-700 focus:!shadow-none focus:!ring-2 focus:!ring-blue-500/30 ' +
          'disabled:!opacity-50 disabled:!cursor-not-allowed',
        cancelButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-gray-700 !bg-white !border !border-gray-200 ' +
          'hover:!bg-gray-50 !transition focus:!shadow-none focus:!ring-2 focus:!ring-gray-200',
        denyButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !bg-red-600 hover:!bg-red-700 !transition',
        footer: '!mt-4 !pt-4 !border-t !border-gray-100 !text-gray-500 !text-xs',
        timerProgressBar: '!bg-blue-500 !h-[3px]',
      },
      showClass: { popup: 'swal2-show-fade-scale' },
      hideClass: { popup: 'swal2-hide-fade-scale' },
    };
  }

  /** Estilos para toasts en esquina inferior derecha. */
  private getToastConfig() {
    return {
      toast: true,
      position: 'bottom-end' as const,
      buttonsStyling: false,
      showCloseButton: true,
      customClass: {
        container: '!font-sans',
        popup:
          '!rounded-xl !shadow-xl !shadow-gray-900/10 !border !border-gray-100 !bg-white ' +
          '!px-4 !py-3 !min-w-[320px] !max-w-md',
        title: '!text-[13.5px] !font-semibold !text-gray-800 !tracking-tight !p-0 !m-0',
        htmlContainer: '!text-[12.5px] !text-gray-600 !leading-snug !p-0 !mt-1 !mx-0',
        icon: '!w-8 !h-8 !min-h-[2rem] !border-0 !mr-2 !my-0',
        closeButton:
          '!w-6 !h-6 !text-gray-300 hover:!text-gray-600 !text-base focus:!shadow-none',
        timerProgressBar: '!h-[2px]',
        confirmButton: '!hidden',
      },
      showClass: { popup: 'swal2-show-slide-in-right' },
      hideClass: { popup: 'swal2-hide-slide-out-right' },
    };
  }

  /** Retorna clases tailwind y color de progressbar según el tipo. */
  private getIconClass(icon: SweetAlertIcon): { icon: string; progress: string } {
    switch (icon) {
      case 'success':
        return { icon: '!text-green-600', progress: '!bg-green-500' };
      case 'error':
        return { icon: '!text-red-600', progress: '!bg-red-500' };
      case 'warning':
        return { icon: '!text-yellow-600', progress: '!bg-yellow-500' };
      case 'info':
        return { icon: '!text-blue-600', progress: '!bg-blue-500' };
      default:
        return { icon: '!text-gray-600', progress: '!bg-gray-400' };
    }
  }

  // ========== Mensajes ==========

  mensajeInformativo(title: string, text: string) {
    const tc = this.getToastConfig();
    const ic = this.getIconClass('info');
    Swal.fire({
      ...tc,
      title,
      html: text,
      icon: 'info',
      timer: 20000,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        ...tc.customClass,
        icon: `${tc.customClass.icon} ${ic.icon}`,
        timerProgressBar: `${tc.customClass.timerProgressBar} ${ic.progress}`,
      },
    });
  }

  mensajeError(title: string, text: string) {
    const tc = this.getToastConfig();
    const ic = this.getIconClass('error');
    Swal.fire({
      ...tc,
      title,
      html: text,
      icon: 'error',
      timer: 20000,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        ...tc.customClass,
        icon: `${tc.customClass.icon} ${ic.icon}`,
        timerProgressBar: `${tc.customClass.timerProgressBar} ${ic.progress}`,
      },
    });
  }

  async mensajaExitoso(text: string, titulo = 'Guardado con éxito') {
    const tc = this.getToastConfig();
    const ic = this.getIconClass('success');
    return await Swal.fire({
      ...tc,
      title: titulo,
      html: text,
      icon: 'success',
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        ...tc.customClass,
        icon: `${tc.customClass.icon} ${ic.icon}`,
        timerProgressBar: `${tc.customClass.timerProgressBar} ${ic.progress}`,
      },
    });
  }

  async mensajaEspera(
    text: string,
    icon: SweetAlertIcon = 'info'
  ) {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass(icon);
    return await (Swal.fire({
      ...bc,
      html: text,
      icon,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
      },
    }),
    Swal.showLoading());
  }

  mensajeValidacion(
    title: string,
    html: string,
    icon: SweetAlertIcon = 'info'
  ) {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass(icon);
    return Swal.fire({
      ...bc,
      title,
      html,
      icon,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
      },
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
    const bc = this.getBaseConfig();
    const ic = this.getIconClass('warning');
    const mensaje = await Swal.fire({
      ...bc,
      title,
      icon: 'warning',
      html,
      cancelButtonText,
      confirmButtonText,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      input: 'text',
      inputLabel: `${inputLabel}${empresaNombre}`,
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
        confirmButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !shadow-sm !transition ' +
          '!bg-red-600 hover:!bg-red-700 focus:!shadow-none focus:!ring-2 focus:!ring-red-500/30 ' +
          'disabled:!opacity-50 disabled:!cursor-not-allowed',
      },
      didOpen: () => {
        Swal.getConfirmButton()?.setAttribute('disabled', 'true');
        const input = Swal.getInput();
        if (input) {
          input.focus();
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
    const tc = this.getToastConfig();
    const ic = this.getIconClass('success');
    return await Swal.fire({
      ...tc,
      position: 'center',
      html: text,
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        ...tc.customClass,
        icon: `${tc.customClass.icon} ${ic.icon}`,
        timerProgressBar: `${tc.customClass.timerProgressBar} ${ic.progress}`,
      },
    }).then(() => {
      window.location.href = '/';
    });
  }

  async alertaTrafico(titulo: string, html: string) {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass('warning');
    return await Swal.fire({
      ...bc,
      title: titulo,
      html,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
        confirmButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !shadow-sm !transition ' +
          '!bg-yellow-500 hover:!bg-yellow-600 focus:!shadow-none focus:!ring-2 focus:!ring-yellow-500/30',
      },
    });
  }

  async confirmar({
    colorConfirmar = 'red',
    texto,
    textoBotonCofirmacion,
    titulo,
  }: {
    titulo: string;
    texto: string;
    textoBotonCofirmacion: string;
    /** Acepta 'red' | 'blue' | 'green' | 'yellow' o un hex legacy para compatibilidad. */
    colorConfirmar?: string;
  }) {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass('warning');

    const mapColor: Record<string, string> = {
      red: '!bg-red-600 hover:!bg-red-700 focus:!ring-red-500/30',
      blue: '!bg-blue-600 hover:!bg-blue-700 focus:!ring-blue-500/30',
      green: '!bg-green-600 hover:!bg-green-700 focus:!ring-green-500/30',
      yellow: '!bg-yellow-500 hover:!bg-yellow-600 focus:!ring-yellow-500/30',
    };
    // Compatibilidad hacia atrás: hex legacy → rojo
    const claseBoton = mapColor[colorConfirmar] || mapColor['red'];

    return await Swal.fire({
      ...bc,
      title: titulo,
      icon: 'warning',
      text: texto,
      showCancelButton: true,
      confirmButtonText: textoBotonCofirmacion,
      cancelButtonText: 'Cancelar',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
        confirmButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !shadow-sm !transition ' +
          `${claseBoton} focus:!shadow-none focus:!ring-2 ` +
          'disabled:!opacity-50 disabled:!cursor-not-allowed',
      },
    });
  }
}
