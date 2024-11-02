export interface SidebarMenu {
    nombre: string;
    link: string;
    iconoClase: string;
    activo?: boolean;
    tipoAcordion?: boolean;
    children?: SidebarMenuItem[];
  }
  
  export interface SidebarMenuItem {
    nombre: string;
    link: string;
    activo?: boolean;
  }