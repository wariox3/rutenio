export interface DecodificarDireccionRequest {
  direccion: string;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Viewport {
  northeast: Location;
  southwest: Location;
}

export interface Geometry {
  location: Location;
  location_type: string;
  viewport: Viewport;
}

export interface NavigationPoint {
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Resultado {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  navigation_points: NavigationPoint[];
  place_id: string;
  types: string[];
}

export interface DatosDireccion {
  latitud: number;
  longitud: number;
  direccion_original: string;
  direccion_formato: string;
  cantidad_resultados: number;
  resultados: Resultado[];
}

export interface DecodificarDireccionResponse {
  error: boolean;
  datos: DatosDireccion;
}
