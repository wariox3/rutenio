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
        // OJO: NO pisar el tamano ni el borde del icono. SweetAlert2 dibuja el
        // check/X/! con lineas absolutas calibradas al icono nativo (80px) y su
        // anillo; forzar w/h o quitar el borde descoloca la figura (la "X" del
        // error se veia como un "techo" rojo roto). Solo se centra y se escala
        // parejo con transform (scale preserva la geometria interna).
        icon: '!mx-auto !mt-1 !mb-3 !scale-90',
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

  // Pide elegir una opción de una lista (input select). `opciones` es un mapa
  // { valor: etiqueta }. Devuelve el valor elegido, o null si cancela.
  async pedirSeleccion(
    title: string,
    opciones: Record<string, string>,
    cfg: { html?: string; valorInicial?: string; confirmButtonText?: string; placeholder?: string } = {}
  ): Promise<string | null> {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass('question');
    const r = await Swal.fire({
      ...bc,
      title,
      html: cfg.html,
      icon: 'question',
      input: 'select',
      inputOptions: opciones,
      inputValue: cfg.valorInicial ?? '',
      inputPlaceholder: cfg.placeholder ?? 'Elegí una opción',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      cancelButtonText: 'Cancelar',
      confirmButtonText: cfg.confirmButtonText ?? 'Aceptar',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
      },
    });
    return r.isConfirmed ? String(r.value ?? '') : null;
  }

  // Como pedirSeleccion pero con BUSCADOR y lista scrolleable: para muchas
  // opciones (p.ej. conductores de un contenedor). Cada item: { valor, etiqueta,
  // detalle? }. El buscador filtra por etiqueta + detalle (nombre, correo, tel).
  // Devuelve el valor elegido, o null si cancela.
  async pedirSeleccionBuscable(
    title: string,
    items: {
      valor: string;
      etiqueta: string;
      detalle?: string;
      /** Glifo del avatar; si no viene se calculan iniciales de la etiqueta. */
      avatar?: string;
    }[],
    cfg: {
      html?: string;
      confirmButtonText?: string;
      placeholder?: string;
      /** valor a preseleccionar (p.ej. el conductor ya asignado). */
      valorInicial?: string;
    } = {}
  ): Promise<string | null> {
    const bc = this.getBaseConfig();
    const ic = this.getIconClass('question');
    let seleccion: string | null = cfg.valorInicial ?? null;
    const esc = (s: string) => this.escaparHtml(s);

    // Iniciales para el avatar: primeras letras de las 2 primeras palabras.
    const iniciales = (s: string) => {
      const p = s.trim().split(/\s+/).filter((w) => /[\wÀ-ÿ]/.test(w));
      if (!p.length) return '·';
      return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase();
    };
    // Hue estable a partir del texto: mismo conductor, mismo color de avatar.
    const hue = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
      return h;
    };

    const filas = items
      .map((it) => {
        const av = it.avatar ?? iniciales(it.etiqueta);
        const h = hue(it.etiqueta);
        return `
      <button type="button" data-valor="${esc(it.valor)}"
        data-buscar="${esc((it.etiqueta + ' ' + (it.detalle ?? '')).toLowerCase())}"
        class="alerta-opcion group w-full text-left px-2.5 py-2 rounded-xl border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition">
        <span class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
          style="background:hsl(${h} 65% 92%);color:hsl(${h} 50% 35%)">${esc(av)}</span>
        <span class="min-w-0 flex-1 flex flex-col">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">${esc(it.etiqueta)}</span>
          ${it.detalle ? `<span class="text-xs text-gray-500 dark:text-gray-400 truncate">${esc(it.detalle)}</span>` : ''}
        </span>
        <svg class="alerta-check shrink-0 w-5 h-5 text-blue-600 opacity-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 10a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z" clip-rule="evenodd"/></svg>
      </button>`;
      })
      .join('');

    const nOpc = items.filter((i) => i.valor !== '0').length;
    const html = `
      ${cfg.html ? `<p class="text-[13px] text-gray-600 dark:text-gray-300 mb-2">${esc(cfg.html)}</p>` : ''}
      <div class="relative mb-2">
        <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 103.4 9.8l3.9 3.9a1 1 0 001.4-1.4l-3.9-3.9A5.5 5.5 0 009 3.5zM5.5 9a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" clip-rule="evenodd"/></svg>
        <input id="alerta-buscar" type="text" autocomplete="off"
          placeholder="${esc(cfg.placeholder ?? 'Buscar…')}"
          class="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500">
      </div>
      <div class="flex items-center justify-between px-1 mb-1">
        <span class="text-[11px] uppercase tracking-wide text-gray-400">${nOpc} ${nOpc === 1 ? 'conductor' : 'conductores'}</span>
        <span id="alerta-contador" class="text-[11px] text-gray-400"></span>
      </div>
      <div id="alerta-opciones" class="max-h-64 overflow-y-auto flex flex-col gap-0.5 text-left -mx-1 px-1">${filas}</div>
      <p id="alerta-sin-resultados" class="hidden text-xs text-gray-400 py-4 text-center">Sin resultados</p>
    `;

    const r = await Swal.fire({
      ...bc,
      title,
      html,
      icon: 'question',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      cancelButtonText: 'Cancelar',
      confirmButtonText: cfg.confirmButtonText ?? 'Aceptar',
      customClass: {
        ...bc.customClass,
        icon: `${bc.customClass.icon} ${ic.icon}`,
      },
      didOpen: (popup) => {
        const cont = popup.querySelector('#alerta-opciones') as HTMLElement;
        const buscar = popup.querySelector('#alerta-buscar') as HTMLInputElement;
        const vacio = popup.querySelector('#alerta-sin-resultados') as HTMLElement;
        const contador = popup.querySelector('#alerta-contador') as HTMLElement;
        const opciones = Array.from(
          cont.querySelectorAll<HTMLButtonElement>('.alerta-opcion')
        );
        const activa = [
          'bg-blue-50',
          'dark:bg-blue-500/10',
          '!border-blue-300',
          'dark:!border-blue-500/40',
        ];
        const marcar = (btn: HTMLButtonElement) => {
          opciones.forEach((o) => {
            o.classList.remove(...activa);
            o.querySelector('.alerta-check')?.classList.add('opacity-0');
          });
          btn.classList.add(...activa);
          btn.querySelector('.alerta-check')?.classList.remove('opacity-0');
          seleccion = btn.dataset['valor'] ?? null;
          Swal.resetValidationMessage();
        };
        opciones.forEach((btn) => {
          btn.addEventListener('click', () => marcar(btn));
          // Preselección (conductor ya asignado): márcalo y hazlo visible.
          if (cfg.valorInicial != null && btn.dataset['valor'] === cfg.valorInicial) {
            marcar(btn);
            btn.scrollIntoView({ block: 'nearest' });
          }
        });
        buscar.addEventListener('input', () => {
          const q = buscar.value.trim().toLowerCase();
          let visibles = 0;
          opciones.forEach((o) => {
            const match = !q || (o.dataset['buscar'] ?? '').includes(q);
            o.classList.toggle('hidden', !match);
            if (match) visibles++;
          });
          vacio.classList.toggle('hidden', visibles > 0);
          contador.textContent = q ? `${visibles} resultado${visibles === 1 ? '' : 's'}` : '';
        });
        buscar.focus();
      },
      preConfirm: () => {
        if (seleccion === null) {
          Swal.showValidationMessage('Elegí una opción');
          return false;
        }
        return seleccion;
      },
    });
    return r.isConfirmed ? String(r.value ?? '') : null;
  }

  private escaparHtml(valor: string): string {
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
