export interface SidebarMenu {
    nombre: string;
    link?: string;
    iconoClase?: string;
    activo?: boolean;
    tipoAcordion?: boolean;
    /** Título de sección (no navegable): solo agrupa visualmente los ítems que le siguen. */
    esEncabezado?: boolean;
    soloAdmin?: boolean;
    soloSuperAdmin?: boolean;
    modulo?: string;
    /** Solo visible si el contenedor tiene habilitado "Conductores en ruta". */
    requiereSeguimiento?: boolean;
    children?: SidebarMenuItem[];
  }

  export interface SidebarMenuItem {
    nombre: string;
    link: string;
    activo?: boolean;
    soloAdmin?: boolean;
    soloSuperAdmin?: boolean;
    modulo?: string;
  }