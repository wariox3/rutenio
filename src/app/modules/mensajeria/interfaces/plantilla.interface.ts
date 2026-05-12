export interface PlantillaVariable {
  indice: number;
  nombre_sugerido: string;
}

export interface PlantillaWhatsapp {
  nombre: string;
  idioma: string;
  texto: string;
  variables: PlantillaVariable[];
}
