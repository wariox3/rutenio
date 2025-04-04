export interface Factura {
  fecha: string;
  id: number;
  tipo: string;
  vr_saldo_enmascarado: string;
  vr_afectado: number;
  vr_saldo: number;
  vr_total: number;
}

export interface Facturas {
  movimientos: Factura[];
}

export interface Consumo {
  contenedor_id: number
  contenedor: string
  subdominio: string
  plan_id: number
  plan__nombre: string
  vr_total: number
}

export interface Consumos {
  consumos: Consumo[];
}

export interface Movimiento {
  id: number
  tipo: string
  fecha: string
  fecha_vence: string
  vr_total: number
  vr_afectado: number
  vr_saldo: number
  vr_saldo_enmascarado: string
}

export interface Movimientos {
  movimientos: Movimiento[]
}
