export interface SidebarMenu {
    nombre: string;
    link: string;
    iconoClase: string;
    activo?: boolean;
    tipoAcordion?: boolean;
    soloAdmin?: boolean;
    soloSuperAdmin?: boolean;
    children?: SidebarMenuItem[];
  }

  export interface SidebarMenuItem {
    nombre: string;
    link: string;
    activo?: boolean;
    soloAdmin?: boolean;
    soloSuperAdmin?: boolean;
  }