/**
 * Metadatos UX por plantilla: nombre humano, descripción corta, icono y labels
 * descriptivos para cada variable.
 *
 * Las plantillas vienen del backend (`PLANTILLAS_TEXTO`) y la UI las ofrece
 * con esta capa de presentación encima. Si una plantilla no aparece acá, se
 * usa un fallback razonable (nombre técnico tal cual + labels genéricos).
 */
export type CategoriaPlantilla = 'utility' | 'marketing';

export interface PlantillaMeta {
  /** Nombre técnico que viene del backend (`entrega`, `entrega_tarifa`, etc.). */
  nombre: string;
  /** Título legible que ve el operador. */
  titulo: string;
  /** Descripción corta de cuándo usarla. */
  descripcion: string;
  /** Clase de ícono Metronic (ej. 'ki-filled ki-package') para la card. */
  icono: string;
  /** Color de acento (clase Tailwind background base). */
  acento: string;
  /** Labels para cada variable, en el mismo orden que `variables[]`. */
  variables: VariableMeta[];
  /** Categoría real con la que Meta la aprobó (afecta costo por envío).
   *  'utility' es ~2× más barata que 'marketing'. Default: 'utility'. */
  categoria?: CategoriaPlantilla;
}

export interface VariableMeta {
  label: string;
  ejemplo: string;
}

const META_BY_NAME: Record<string, PlantillaMeta> = {
  entrega: {
    nombre: 'entrega',
    titulo: 'Entrega — paquete despachado',
    descripcion: 'Confirma al cliente que su pedido ya salió a ruta.',
    icono: 'ki-filled ki-package',
    acento: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Empresa remitente', ejemplo: 'Energy Pruebas' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
    ],
  },
  entrega_tarifa: {
    nombre: 'entrega_tarifa',
    titulo: 'Entrega con cobro al recibir',
    descripcion: 'Igual que Entrega pero incluye el valor a pagar contra entrega.',
    icono: 'ki-filled ki-dollar',
    acento: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Empresa remitente', ejemplo: 'Energy Pruebas' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
      { label: 'Valor a pagar (sin $)', ejemplo: '15.000' },
    ],
  },
  en_camino: {
    nombre: 'en_camino',
    titulo: 'En camino — conductor saliendo',
    descripcion: 'Notifica que el conductor inició la ruta hacia la dirección.',
    icono: 'ki-filled ki-delivery',
    acento: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
    ],
  },
  proximo: {
    nombre: 'proximo',
    titulo: 'Próximo — llegando pronto',
    descripcion: 'Avisa que el conductor llega en X minutos.',
    icono: 'ki-filled ki-geolocation',
    acento: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
      { label: 'Minutos para llegar', ejemplo: '5' },
    ],
  },
  entregado: {
    nombre: 'entregado',
    titulo: 'Entregado — confirmación',
    descripcion: 'Confirma que la entrega se realizó correctamente.',
    icono: 'ki-filled ki-check-circle',
    acento: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
      { label: 'Empresa', ejemplo: 'Energy Pruebas' },
    ],
  },
  novedad: {
    nombre: 'novedad',
    titulo: 'Novedad — incidencia',
    descripcion: 'Reporta una novedad (ausente, dirección errada, etc.).',
    icono: 'ki-filled ki-information-5',
    acento: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
      { label: 'Motivo de la novedad', ejemplo: 'destinatario ausente' },
    ],
  },
  reagendar: {
    nombre: 'reagendar',
    titulo: 'Reagendar — nueva fecha',
    descripcion: 'Avisa que la entrega se reprogramó para otro horario.',
    icono: 'ki-filled ki-calendar-2',
    acento: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
      { label: 'Nueva fecha / horario', ejemplo: 'mañana 10:00 AM' },
    ],
  },
  consulta_horario: {
    nombre: 'consulta_horario',
    titulo: 'Consulta de horario',
    descripcion: 'Pregunta al cliente en qué horario prefiere recibir el pedido.',
    icono: 'ki-filled ki-time',
    acento: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
    variables: [
      { label: 'Nombre del cliente', ejemplo: 'Otto' },
      { label: 'Empresa', ejemplo: 'Energy Pruebas' },
      { label: 'Guía / documento', ejemplo: 'GUIA-001' },
    ],
  },
  saludo: {
    nombre: 'saludo',
    titulo: 'Saludo — abrir conversación',
    descripcion: 'Mensaje genérico para iniciar contacto sin motivo operativo. Más caro por envío (Marketing).',
    icono: 'ki-filled ki-message-text-2',
    acento: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    categoria: 'marketing',
    variables: [
      { label: 'Empresa', ejemplo: 'Energy Pruebas' },
    ],
  },
  saludo_pedido: {
    nombre: 'saludo_pedido',
    titulo: 'Saludo — sobre el pedido',
    descripcion: 'Inicia conversación con un cliente que tiene un pedido activo. Más probable que Meta apruebe como Utility.',
    icono: 'ki-filled ki-message-question',
    acento: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    variables: [
      { label: 'Empresa', ejemplo: 'Energy Pruebas' },
    ],
  },
  hello_world: {
    nombre: 'hello_world',
    titulo: 'Saludo de prueba',
    descripcion: 'Plantilla por defecto de Meta. Útil para verificar conexión.',
    icono: 'ki-filled ki-message-text',
    acento: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    variables: [],
  },
};

/** Devuelve metadatos para una plantilla. Si no está mapeada, usa fallback. */
export function obtenerPlantillaMeta(
  nombre: string,
  variablesCount = 0,
): PlantillaMeta {
  const meta = META_BY_NAME[nombre];
  if (meta) return meta;
  // Fallback para plantillas no mapeadas: nombre técnico + variables genéricas.
  return {
    nombre,
    titulo: nombre,
    descripcion: 'Plantilla disponible.',
    icono: 'ki-filled ki-document',
    acento: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    variables: Array.from({ length: variablesCount }, (_, i) => ({
      label: `Variable ${i + 1}`,
      ejemplo: '',
    })),
  };
}
