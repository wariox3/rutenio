import { Operator } from "../../interfaces/filtro.interface";

export const OPERADORES_FILTRO: Operator[] = [
  { symbol: 'contains', name: 'Contiene', types: ['string'], default: true },
  {
    symbol: '=',
    name: 'Igual',
    types: ['string', 'number', 'date', 'boolean', 'relation'],
    default: true,
  },
  {
    symbol: '>',
    name: 'Mayor a',
    types: ['number', 'date'],
    default: false,
  },
  {
    symbol: '>=',
    name: 'Mayor o igual a',
    types: ['number', 'date'],
    default: false,
  },
  {
    symbol: '<',
    name: 'Menor a',
    types: ['number', 'date'],
    default: false,
  },
  {
    symbol: '<=',
    name: 'Menor o igual a',
    types: ['number', 'date'],
    default: false,
  },
  {
    symbol: 'in',
    name: 'En lista',
    types: ['relation'],
    default: false, // ⚠️ No debe ser default si ya tienes '=' como default
  },
];
