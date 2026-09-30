import { Injectable } from '@angular/core';
import { FilterCondition } from '../interfaces/filtro.interface';
import { ParametrosApiPost } from '../types/api.type';

@Injectable({
  providedIn: 'root'
})
export class FilterTransformerService {
  transformToApiParams(filters: FilterCondition[]): Record<string, any> {
    if (!filters || filters.length === 0) {
      return {};
    }

    const apiParams: Record<string, any> = {};

    filters.forEach(filter => {
      if (!this.isValidFilter(filter)) {
        return;
      }

      const apiKey = this.getApiKey(filter.field, filter.operator);
      const transformedValue = this.transformValue(filter.value, filter.field);

      apiParams[apiKey] = transformedValue;
    });

    return apiParams;
  }

  transformToApiPostParams (filters: FilterCondition[]): ParametrosApiPost[] {
    if (!filters || filters.length === 0) {
      return [];
    }

    const apiParams: ParametrosApiPost[] = [];

    filters.forEach(filter => {
      if (!this.isValidFilter(filter)) {
        return;
      }

      let propiedad = filter.field;
      let operador = this.transformOperator(filter.operator);
      const indiceLookup = filter.field.lastIndexOf('__');
      if (indiceLookup !== -1) {
        propiedad = filter.field.substring(0, indiceLookup);
        operador = filter.field.substring(indiceLookup + 2);
      }

      apiParams.push({
        propiedad: propiedad,
        valor1: filter.value,
        operador: operador
      });
    });

    return apiParams;
  }

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

  private isValidFilter(filter: FilterCondition): boolean {
    return !!filter.field && !!filter.operator && filter.value !== undefined && filter.value !== '';
  }

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

  private transformValue(value: any, field?: string): any {
    if (field?.endsWith('_id') || field === 'id') {
      return Number(value) || value;
    }

    return value;
  }
}
