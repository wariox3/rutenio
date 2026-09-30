import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  signal,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, map } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GeneralService } from '../../../services/general.service';
import { FilterCondition, FilterField, Operator } from '../../../../core/interfaces/filtro.interface';
import { OPERADORES_FILTRO } from '../../../../core/constants/filter/operadores-filtro.constant';
import { FilterTransformerService } from '../../../../core/servicios/filter-transformer.service';
import { MultiSelectComponent } from "../form/multi-select/multi-select.component";

interface RelationOption {
  value: any;
  display: string;
}

@Component({
  selector: 'app-filtro',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss',
})
export class FiltroComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChildren('valueInputElement') valueInputElements!: QueryList<ElementRef>;
  @Input() availableFields: FilterField[] = [];
  @Output() filtersApply = new EventEmitter<Record<string, any>>();
  @Output() filtersApplyCrudo = new EventEmitter<FilterCondition[]>();
  @Input() localStorageKey: string | null = null;

  public filterConditions: FilterCondition[] = [];
  operators: Operator[] = OPERADORES_FILTRO;

  relationOptions: { [fieldName: string]: RelationOption[] } = {};
  loadingRelationOptions: { [fieldName: string]: boolean } = {};
  searchTerms: { [fieldName: string]: string } = {};

  private searchSubjects: { [fieldName: string]: Subject<string> } = {};
  private searchSubscriptions: Subscription[] = [];
  private changeDetectorRef = inject(ChangeDetectorRef);
  private _filterTransformerService = inject(FilterTransformerService);

  constructor(private generalService: GeneralService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['localStorageKey'] && !changes['localStorageKey'].firstChange) {
      if (
        changes['localStorageKey'].currentValue !==
        changes['localStorageKey'].previousValue
      ) {
        this._loadFiltersFromLocalStorage();
      }
    }

    if (changes['availableFields'] && this.availableFields) {
      this._preloadRelationData();
    }
  }

  ngOnInit(): void {
    this._loadFiltersFromLocalStorage();
    this._preloadRelationData();
    this._setupSearchSubjects();
  }

  ngOnDestroy(): void {
    this.searchSubscriptions.forEach((subscription) =>
      subscription.unsubscribe(),
    );
  }

  private _setupSearchSubjects(): void {
    this.availableFields.forEach((field) => {
      if (field.type === 'relation') {
        if (!this.searchSubjects[field.name]) {
          const subject = new Subject<string>();

          const subscription = subject
            .pipe(
              debounceTime(500),
              distinctUntilChanged()
            )
            .subscribe((searchTerm) => {
              this._loadRelationOptions(field.name, searchTerm);
            });

          this.searchSubjects[field.name] = subject;
          this.searchSubscriptions.push(subscription);
        }
      }
    });
  }

  private _preloadRelationData(): void {
    if (!this.availableFields?.length) {
      return;
    }

    const fieldsToPreload = this.availableFields.filter(
      (field) => field.type === 'relation' && field.relationConfig?.preload,
    );

    fieldsToPreload.forEach((field) => {
      this._loadRelationOptions(field.name, '');
    });
  }

  addFilterCondition(): void {
    this.filterConditions.push(this.createEmptyCondition());
  }

  removeFilterCondition(index: number): void {
    this.filterConditions.splice(index, 1);
    if (this.filterConditions.length === 0) {
      this.filterConditions.push(this.createEmptyCondition());
    }
  }

  onFieldChange(condition: FilterCondition, index: number): void {
    condition.value = '';
    condition.displayValue = '';
    condition.operator = '';

    if (!condition.field) {
      return;
    }

    const selectedField = this.availableFields.find(
      (field) => field.name === condition.field,
    );

    if (!selectedField) {
      return;
    }

    const operatorsForField = this.getOperatorsForField(condition.field);
    const defaultOperator = operatorsForField.find((op) => op.default);

    if (defaultOperator) {
      condition.operator = defaultOperator.symbol;
    }

    if (selectedField.type === 'relation' && selectedField.relationConfig) {
      this._loadRelationOptions(selectedField.name, '');
      condition.multiple = selectedField.relationConfig?.multiple || false;

      if (!this.searchSubjects[selectedField.name]) {
        this._setupSearchSubjectForField(selectedField.name);
      }
    }

    setTimeout(() => {
      const inputElement = this.valueInputElements?.toArray()[index];
      if (inputElement && inputElement.nativeElement) {
        inputElement.nativeElement.focus();
      }
    });
  }

  private _setupSearchSubjectForField(fieldName: string): void {
    const subject = new Subject<string>();

    const subscription = subject
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm) => {
        this._loadRelationOptions(fieldName, searchTerm);
      });

    this.searchSubjects[fieldName] = subject;
    this.searchSubscriptions.push(subscription);
  }

  handleEnterKey(): void {
    const canApply = this.filterConditions.some(
      (fc) =>
        fc.field && fc.operator && fc.value !== undefined && fc.value !== '',
    );

    if (canApply) {
      this.applyFilters();
    }
  }

  private _getValidFilters(): FilterCondition[] {
    return this.filterConditions.filter(
      (condition) =>
        condition.field &&
        condition.operator &&
        condition.value !== undefined &&
        condition.value !== '',
    );
  }

  applyFilters(): void {
    const validFilters = this._getValidFilters();
    const parametros =
      this._filterTransformerService.transformToApiParams(validFilters);
    this.filtersApply.emit(parametros);
    this.filtersApplyCrudo.emit(validFilters);
    this._saveFiltersToLocalStorage();
  }

  getOperatorsForField(fieldName: string): Operator[] {
    const field = this.availableFields.find(
      (field) => field.name === fieldName,
    );
    if (!field) return [];
    return this.operators.filter((op) => op.types.includes(field.type));
  }

  private createEmptyCondition(): FilterCondition {
    return { field: '', operator: '', value: '', multiple: false };
  }

  getInputType(fieldName: string): string {
    if (!fieldName) return 'text';

    const field = this.availableFields.find(
      (field) => field.name === fieldName,
    );
    if (!field) return 'text';

    switch (field.type) {
      case 'date':
        return 'date';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'relation':
        return 'relation';
      default:
        return 'text';
    }
  }

  private _loadFiltersFromLocalStorage(): void {
    if (!this.localStorageKey || typeof localStorage === 'undefined') {
      this.filterConditions = [this.createEmptyCondition()];
      return;
    }

    try {
      const savedFilters = localStorage.getItem(this.localStorageKey);
      if (!savedFilters) {
        this.filterConditions = [this.createEmptyCondition()];
        return;
      }

      const parsedFilters: FilterCondition[] = JSON.parse(savedFilters);
      if (!Array.isArray(parsedFilters) || parsedFilters.length === 0) {
        this.filterConditions = [this.createEmptyCondition()];
        return;
      }

      this.filterConditions = parsedFilters;

      this.filterConditions.forEach((condition) => {
        const field = this.availableFields.find((f) => f.name === condition.field);
        if (field?.type === 'relation') {
          condition.multiple = field.relationConfig?.multiple || false;
        }
      });

      this._loadRelationDisplayValues();
    } catch (error) {
      console.error('Error al cargar filtros desde localStorage:', error);
      this.filterConditions = [this.createEmptyCondition()];
    }
  }

  private _loadRelationDisplayValues(): void {
    this.filterConditions.forEach((condition) => {
      if (!condition.field) return;

      const field = this.availableFields.find(
        (f) => f.name === condition.field,
      );
      if (!field || field.type !== 'relation' || !field.relationConfig) return;

      if (condition.value) {
        if (!this.searchTerms) {
          this.searchTerms = {};
        }

        this.searchTerms[condition.field] = condition.displayValue || '';
      }
    });
  }

  clearFiltersFromLocalStorage(): void {
    this.filterConditions = [this.createEmptyCondition()];
    if (this.localStorageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.localStorageKey);
      } catch (error) {
        console.error('Error al eliminar filtros de localStorage:', error);
      }
    }
  }

  clearAllFilters(): void {
    this.clearFiltersFromLocalStorage();
    this.filtersApply.emit([]);
    this.filtersApplyCrudo.emit([]);
  }

  private _saveFiltersToLocalStorage(): void {
    if (this.localStorageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          this.localStorageKey,
          JSON.stringify(this.filterConditions),
        );
      } catch (error) {
        console.error('Error al guardar filtros en localStorage:', error);
      }
    }
  }

  getPlaceholder(fieldName: string): string {
    if (!fieldName) return 'Valor';

    const field = this.availableFields.find(
      (field) => field.name === fieldName,
    );
    if (!field) return 'Valor';

    if (field.type === 'relation') {
      return `Buscar ${field.displayName.toLowerCase()}`;
    }

    return `Ingrese ${field.displayName.toLowerCase()}`;
  }

  private _loadRelationOptions(
    fieldName: string,
    searchTerm: string = '',
  ): void {
    const field = this.availableFields.find((f) => f.name === fieldName);
    if (!field || field.type !== 'relation' || !field.relationConfig) {
      return;
    }

    const config = field.relationConfig;
    this.loadingRelationOptions[fieldName] = true;

    const queryParams = { ...(config.queryParams || {}) };
    if (searchTerm) {
      const searchField = config.searchField || 'search';
      queryParams[searchField] = searchTerm;
    }

    this.generalService
      .consultaApi<any[]>(config.endpoint, queryParams)
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.relationOptions[fieldName] = response.map((item) => ({
              value: item[config.valueField],
              display: item[config.displayField],
            }));
            this.changeDetectorRef.detectChanges();
          } else {
            console.error(
              `Formato de respuesta inesperado para el campo de relación ${fieldName}:`,
              response,
            );
            this.relationOptions[fieldName] = [];
          }
        },
        error: (error) => {
          console.error(
            `Error al cargar opciones de relación para ${fieldName}:`,
            error,
          );
          this.relationOptions[fieldName] = [];
        },
        complete: () => {
          this.loadingRelationOptions[fieldName] = false;
        },
      });
  }

  onFocusDropdown(toggleButton: HTMLButtonElement): void {
    // Click programático en el dropdown-toggle oculto de Metronic para abrirlo al enfocar el input.
    setTimeout(() => {
      toggleButton.click();
    }, 0);
  }

  onRelationSearch(fieldName: string, searchTerm: string): void {
    if (!fieldName) return;

    if (!this.searchTerms) {
      this.searchTerms = {};
    }
    this.searchTerms[fieldName] = searchTerm;

    if (!this.searchSubjects || !this.searchSubjects[fieldName]) {
      this._setupSearchSubjectForField(fieldName);
    }

    if (this.searchSubjects && this.searchSubjects[fieldName]) {
      this.searchSubjects[fieldName].next(searchTerm);
    } else {
      console.warn(`No hay subject de búsqueda disponible para el campo: ${fieldName}`);
      this._loadRelationOptions(fieldName, searchTerm);
    }
  }

  onRelationOptionSelected(
    condition: FilterCondition,
    option: RelationOption,
  ): void {
    condition.value = option.value;
    condition.displayValue = option.display;
    this.searchTerms[condition.field] = option.display;
    this.changeDetectorRef.detectChanges();
  }

  onRelationOptionSelectedMultiple(
    condition: FilterCondition,
    option: RelationOption,
  ): void {
    condition.value = option.value.join(',');
    condition.displayValue = option.display;
    this.searchTerms[condition.field] = option.display;
    this.changeDetectorRef.detectChanges();
  }

  isRelationField(fieldName: string): boolean {
    if (!fieldName) return false;

    const field = this.availableFields.find((f) => f.name === fieldName);
    return field?.type === 'relation';
  }

  getRelationOptions(fieldName: string): RelationOption[] {
    return this.relationOptions[fieldName] || [];
  }

  isLoadingRelationOptions(fieldName: string): boolean {
    return this.loadingRelationOptions[fieldName] || false;
  }
}
