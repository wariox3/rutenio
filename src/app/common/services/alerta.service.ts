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
          '!rounded-2xl !shadow-2xl !shadow-gray-900/10 !border !border-gray-100 dark:!border-gray-800 ' +
          '!bg-white dark:!bg-gray-900 !p-6 !max-w-md',
        title: '!text-[17px] !font-semibold !text-gray-800 dark:!text-gray-100 !tracking-tight !mt-3',
        htmlContainer: '!text-[14px] !text-gray-600 dark:!text-gray-300 !leading-relaxed !mt-2',
        icon: '!mx-auto !my-2 !border-0 !w-14 !h-14',
        closeButton:
          '!w-8 !h-8 !rounded-full !text-gray-400 dark:!text-gray-500 ' +
          'hover:!text-gray-700 dark:hover:!text-gray-200 hover:!bg-gray-100 dark:hover:!bg-gray-800 ' +
          '!transition focus:!shadow-none',
        input:
          '!mt-3 !border !border-gray-200 dark:!border-gray-700 !rounded-lg !px-3 !py-2 !text-sm ' +
          '!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-gray-100 ' +
          'focus:!outline-none focus:!ring-2 focus:!ring-blue-500/30 focus:!border-blue-500',
        inputLabel: '!text-[13px] !text-gray-600 dark:!text-gray-300 !mt-3 !mb-1',
        validationMessage:
          '!bg-red-50 dark:!bg-red-500/10 !text-red-700 dark:!text-red-300 ' +
          '!text-xs !rounded-lg !mt-3 !py-2 !px-3',
        actions: '!mt-5 !flex !justify-end !gap-2 !w-full',
        confirmButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !shadow-sm !transition ' +
          '!bg-blue-600 hover:!bg-blue-700 focus:!shadow-none focus:!ring-2 focus:!ring-blue-500/30 ' +
          'disabled:!opacity-50 disabled:!cursor-not-allowed',
        cancelButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium ' +
          '!text-gray-700 dark:!text-gray-200 !bg-white dark:!bg-gray-800 ' +
          '!border !border-gray-200 dark:!border-gray-700 ' +
          'hover:!bg-gray-50 dark:hover:!bg-gray-700 !transition ' +
          'focus:!shadow-none focus:!ring-2 focus:!ring-gray-200 dark:focus:!ring-gray-700',
        denyButton:
          '!px-4 !py-2 !rounded-lg !text-sm !font-medium !text-white !bg-red-600 hover:!bg-red-700 !transition',
        footer:
          '!mt-4 !pt-4 !border-t !border-gray-100 dark:!border-gray-800 ' +
          '!text-gray-500 dark:!text-gray-400 !text-xs',
        timerProgressBar: '!bg-blue-500 !h-[3px]',
      },
      showClass: { popup: 'swal2-show-fade-scale' },
      hideClass: { popup: 'swal2-hide-fade-scale' },
    };
  }

  /**
   * Modal centrado genérico (éxito / error / info / advertencia). Toda la app
   * usa este mismo formato: título + mensaje + botón "Entendido", con el icono
   * y color según la severidad. Reemplaza a los toasts (decisión de UX: todas
   * las alertas son modales centrados que piden acuse, no avisos fugaces).
   */
  private modalCentrado(title: string, html: string, icon: SweetAlertIcon) {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass(icon);
    return Swal.fire({
      ...bc,
      title,
      html,
      icon,
      showCloseButton: true,
      confirmButtonText: 'Entendido',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
        actions: '!mt-5 !flex !justify-center !gap-2 !w-full',
      },
    });
  }

  /** Retorna clases tailwind y color de progressbar según el tipo. */
  private getIconClass(icon: SweetAlertIcon): { icon: string; progress: string } {
    switch (icon) {
      case 'success':
        return { icon: '!text-green-600 dark:!text-green-400', progress: '!bg-green-500' };
      case 'error':
        return { icon: '!text-red-600 dark:!text-red-400', progress: '!bg-red-500' };
      case 'warning':
        return { icon: '!text-yellow-600 dark:!text-yellow-400', progress: '!bg-yellow-500' };
      case 'info':
        return { icon: '!text-blue-600 dark:!text-blue-400', progress: '!bg-blue-500' };
      default:
        return { icon: '!text-gray-600 dark:!text-gray-300', progress: '!bg-gray-400' };
    }
  }

  // ========== Mensajes ==========

  mensajeInformativo(title: string, text: string) {
    return this.modalCentrado(title, text, 'info');
  }

  mensajeError(title: string, text: string) {
    return this.modalCentrado(title, text, 'error');
  }

  async mensajaExitoso(text: string, titulo = 'Guardado con éxito') {
    return await this.modalCentrado(titulo, text, 'success');
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
        // El spinner de showLoading() vive en el area de acciones; la config
        // base la deja en justify-end, por eso quedaba a la derecha. Se centra.
        actions: '!mt-5 !flex !justify-center !gap-2 !w-full',
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

  // Pide un texto al usuario (input). Devuelve el valor (trim) o null si cancela.
  async pedirTexto(
    title: string,
    opciones: { html?: string; placeholder?: string; valorInicial?: string; confirmButtonText?: string } = {}
  ): Promise<string | null> {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass('question');
    const r = await Swal.fire({
      ...bc,
      title,
      html: opciones.html,
      icon: 'question',
      input: 'text',
      inputValue: opciones.valorInicial ?? '',
      inputPlaceholder: opciones.placeholder ?? '',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      cancelButtonText: 'Cancelar',
      confirmButtonText: opciones.confirmButtonText ?? 'Enviar',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
      },
    });
    return r.isConfirmed ? String(r.value ?? '').trim() : null;
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

  /**
   * Resumen visual de una importación (Excel / complemento / nuevo desde
   * complemento). Recibe los conteos que devuelve el backend y muestra un
   * desglose con el diseño de Ruteo. Solo lista las filas con valor > 0.
   * - success: entraron guías y sin problemas.
   * - warning: entraron pero hubo sin-geocodificar / fuera de zona / inválidas.
   * - info: no entró ninguna guía nueva (p. ej. todas ya estaban).
   * Las clases de color son las mismas que ya emite getIconClass(), así que
   * están garantizadas en el build (sin riesgo de purge de Tailwind); el
   * layout va por estilos inline para no depender de clases dinámicas.
   */
  async resultadoImportacion(
    resumen: {
      cantidad?: number;
      duplicadas?: number;
      descartadas?: number;
      sin_ubicar?: number;
      errores_guia?: number;
    },
    opciones: { tituloExito?: string } = {}
  ) {
    const cantidad = resumen.cantidad ?? 0;
    const duplicadas = resumen.duplicadas ?? 0;
    const descartadas = resumen.descartadas ?? 0;
    const sinUbicar = resumen.sin_ubicar ?? 0;
    const errores = resumen.errores_guia ?? 0;

    const hayProblemas = descartadas > 0 || sinUbicar > 0 || errores > 0;
    const icon: SweetAlertIcon = cantidad > 0 ? (hayProblemas ? 'warning' : 'success') : 'info';

    const filas = [
      { label: 'Importadas', valor: cantidad, dot: '!bg-green-500', texto: '!text-green-600 dark:!text-green-400' },
      { label: 'Ya estaban en Ruteo', valor: duplicadas, dot: '!bg-gray-400', texto: '!text-gray-500 dark:!text-gray-400' },
      { label: 'Sin geocodificar (revisar dirección)', valor: sinUbicar, dot: '!bg-yellow-500', texto: '!text-yellow-600 dark:!text-yellow-400' },
      { label: 'Fuera de las zonas seleccionadas', valor: descartadas, dot: '!bg-blue-500', texto: '!text-blue-600 dark:!text-blue-400' },
      { label: 'Con datos inválidos', valor: errores, dot: '!bg-red-500', texto: '!text-red-600 dark:!text-red-400' },
    ].filter((f) => f.valor > 0);

    const filaEstilo =
      'display:flex;align-items:center;justify-content:space-between;' +
      'border:1px solid rgba(128,128,128,.18);border-radius:.5rem;padding:.45rem .7rem;';
    const filasHtml = filas
      .map(
        (f) => `
      <div style="${filaEstilo}">
        <span style="display:flex;align-items:center;gap:.5rem">
          <span class="${f.dot}" style="display:inline-block;width:.5rem;height:.5rem;border-radius:9999px"></span>${f.label}
        </span>
        <span class="${f.texto}" style="font-weight:600">${f.valor}</span>
      </div>`
      )
      .join('');

    const encabezado =
      cantidad > 0
        ? `<div style="text-align:center">
             <div class="!text-gray-800 dark:!text-gray-100" style="font-size:1.9rem;font-weight:700;line-height:1.1">${cantidad}</div>
             <div class="!text-gray-500 dark:!text-gray-400" style="font-size:.8rem">${cantidad === 1 ? 'guía importada' : 'guías importadas'}</div>
           </div>`
        : `<div class="!text-gray-600 dark:!text-gray-300" style="text-align:center;font-size:.85rem">No se importó ninguna guía nueva.</div>`;

    const html =
      `${encabezado}<div style="display:flex;flex-direction:column;gap:.5rem;margin-top:1rem;text-align:left;font-size:.8rem">${filasHtml}</div>`;

    const bc = this.getBaseConfig();
    const ic = this.getIconClass(icon);
    const titulo =
      cantidad > 0
        ? hayProblemas
          ? 'Importación con avisos'
          : opciones.tituloExito ?? 'Importación completa'
        : opciones.tituloExito ?? 'Importación finalizada';

    return await Swal.fire({
      ...bc,
      title: titulo,
      html,
      icon,
      confirmButtonText: 'Entendido',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
        actions: '!mt-5 !flex !justify-center !gap-2 !w-full',
      },
    });
  }

  cerrarMensajes() {
    return Swal.close();
  }

  mensajeVisible() {
    return Swal.isVisible();
  }

  async mensajaContactoLandinpage(text: string) {
    await this.modalCentrado('¡Gracias por escribirnos!', text, 'success');
    window.location.href = '/';
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
