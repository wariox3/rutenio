// filter-transformer.service.ts
import { Injectable } from '@angular/core';
import { FilterCondition } from '../interfaces/filtro.interface';
import { ParametrosApiPost } from '../types/api.type';

@Injectable({
  providedIn: 'root'
})
export class FilterTransformerService {
  /**
   * Transforma un array de condiciones de filtro a un objeto de parámetros para la API
   * @param filters Array de condiciones de filtro
   * @returns Objeto con los parámetros para la API
   */
  transformToApiParams(filters: FilterCondition[]): Record<string, any> {
    if (!filters || filters.length === 0) {
      return {};
    }

    const apiParams: Record<string, any> = {};

    filters.forEach(filter => {
      if (!this.isValidFilter(filter)) {
        return; // Saltar filtros inválidos
      }

      const apiKey = this.getApiKey(filter.field, filter.operator);
      const transformedValue = this.transformValue(filter.value, filter.field);

      apiParams[apiKey] = transformedValue;
    });

    return apiParams;
  }

  /**
   * Transforma un array de condiciones de filtro a un array de parámetros para la API
   * @param filters Array de condiciones de filtro
   * @returns Array de parámetros para la API
   */
  transformToApiPostParams (filters: FilterCondition[]): ParametrosApiPost[] {
    if (!filters || filters.length === 0) {
      return [];
    }

    const apiParams: ParametrosApiPost[] = [];

    filters.forEach(filter => {
      if (!this.isValidFilter(filter)) {
        return; // Saltar filtros inválidos
      }

      const operador = this.transformOperator(filter.operator);
      // const transformedValue = this.transformValue(filter.value, filter.field);

      apiParams.push({
        propiedad: filter.field,
        valor1: filter.value,
        operador: operador
      });
    });

    return apiParams;
  }

  /**
   * Convierte los parámetros de la API a un string de query
   * @param params Objeto con los parámetros
   * @returns String de query (ej: "param1=value1&param2=value2")
   */
  toQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => {
        const value = typeof params[key] === 'object'
          ? JSON.stringify(params[key])
          : params[key];
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }

  /**
   * Verifica si un filtro es válido
   * @param filter Condición de filtro
   * @returns boolean
   */
  private isValidFilter(filter: FilterCondition): boolean {
    return !!filter.field && !!filter.operator && filter.value !== undefined && filter.value !== '';
  }

  /**
   * Genera la clave para el parámetro de la API basado en el campo y operador
   * @param field Nombre del campo
   * @param operator Operador
   * @returns string
   */
  private getApiKey(field: string, operator: string): string {
    const operatorMap: Record<string, string> = {
      '=': '',
      '!=': '__ne',
      '>': '__gt',
      '<': '__lt',
      '>=': '__gte',
      '<=': '__lte',
      'contains': '__icontains',
      'startsWith': '__startswith',
      'endsWith': '__endswith',
      'in': '__in'
    };

    const operatorSuffix = operatorMap[operator] || '';
    return `${field}${operatorSuffix}`;
  }

  private transformOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      '=': 'exact',
      '!=': 'ne',
      '>': 'gt',
      '<': 'lt',
      '>=': 'gte',
      '<=': 'lte',
      'contains': 'icontains',
      'startsWith': 'startswith',
      'endsWith': 'endswith',
      'in': 'in'
    };

    return operatorMap[operator] || operator;
  }

  /**
   * Transforma el valor según el tipo de campo si es necesario
   * @param value Valor original
   * @param field Nombre del campo (opcional, para transformaciones específicas)
   * @returns any
   */
  private transformValue(value: any, field?: string): any {
    // Aquí puedes agregar lógica adicional para transformar valores específicos
    // Ejemplo: convertir strings a números para ciertos campos
    if (field?.endsWith('_id') || field === 'id') {
      return Number(value) || value;
    }

    return value;
  }
}
