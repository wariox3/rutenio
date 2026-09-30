export class InputNumericoValidator {
  static onKeyDown(event: KeyboardEvent): void {
    const teclasProhibidas = ['-', 'e', 'E', '+'];

    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }

    if (teclasControl.includes(event.key)) {
      return;
    }

    if (teclasProhibidas.includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
  
  static onKeyDownSoloDigitos(event: KeyboardEvent): void {
    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }

    if (teclasControl.includes(event.key)) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
  
  static onKeyDownDecimal(event: KeyboardEvent, permitirPunto: boolean = true): void {
    const teclasControl = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }

    if (teclasControl.includes(event.key)) {
      return;
    }

    if (permitirPunto && event.key === '.') {
      const input = event.target as HTMLInputElement;
      if (input.value.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    const teclasProhibidas = ['-', 'e', 'E', '+'];
    if (teclasProhibidas.includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
