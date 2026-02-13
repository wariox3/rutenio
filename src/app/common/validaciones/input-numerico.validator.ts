/**
 * Utilidad para validación de inputs numéricos
 * Previene la entrada de caracteres no deseados en campos numéricos
 */
export class InputNumericoValidator {
  /**
   * Previene la entrada de caracteres no numéricos en inputs
   * Bloquea: '-', 'e', 'E', '+' y otros caracteres especiales
   * @param event KeyboardEvent del input
   * @returns void
   */
  static onKeyDown(event: KeyboardEvent): void {
    // Lista de teclas prohibidas para inputs numéricos
    const teclasProhibidas = ['-', 'e', 'E', '+'];
    
    // Permitir teclas de control (backspace, delete, arrows, tab, etc.)
    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }
    
    // Permitir teclas de control
    if (teclasControl.includes(event.key)) {
      return;
    }
    
    // Bloquear teclas prohibidas
    if (teclasProhibidas.includes(event.key)) {
      event.preventDefault();
      return;
    }
    
    // Permitir solo números (0-9)
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
  
  /**
   * Versión más estricta que solo permite dígitos
   * @param event KeyboardEvent del input
   * @returns void
   */
  static onKeyDownSoloDigitos(event: KeyboardEvent): void {
    // Permitir teclas de control
    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }
    
    // Permitir teclas de control
    if (teclasControl.includes(event.key)) {
      return;
    }
    
    // Solo permitir dígitos 0-9
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
  
  /**
   * Permite números decimales (con punto)
   * @param event KeyboardEvent del input
   * @param permitirPunto boolean - si permite punto decimal
   * @returns void
   */
  static onKeyDownDecimal(event: KeyboardEvent, permitirPunto: boolean = true): void {
    // Permitir teclas de control
    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }
    
    // Permitir teclas de control
    if (teclasControl.includes(event.key)) {
      return;
    }
    
    // Permitir punto decimal si está habilitado
    if (permitirPunto && event.key === '.') {
      const input = event.target as HTMLInputElement;
      // Solo permitir un punto decimal
      if (input.value.includes('.')) {
        event.preventDefault();
      }
      return;
    }
    
    // Bloquear caracteres prohibidos
    const teclasProhibidas = ['-', 'e', 'E', '+'];
    if (teclasProhibidas.includes(event.key)) {
      event.preventDefault();
      return;
    }
    
    // Solo permitir dígitos
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
