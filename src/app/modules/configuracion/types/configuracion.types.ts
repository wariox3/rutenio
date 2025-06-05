export interface Configuracion {
    id: number
    empresa: number
    informacion_factura: any
    informacion_factura_superior: any
    gen_uvt: string
    gen_emitir_automaticamente: boolean
    hum_factor: string
    hum_salario_minimo: string
    hum_auxilio_transporte: string
    hum_entidad_riesgo: any
    pos_documento_tipo: number
    rut_sincronizar_complemento: boolean
    rut_rutear_franja: boolean
    rut_direccion_origen: string
    rut_longitud: string
    rut_latitud: string
}
  