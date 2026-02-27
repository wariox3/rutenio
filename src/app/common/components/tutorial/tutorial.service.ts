import { Injectable, signal, computed } from '@angular/core';

export interface PasoTutorial {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
  colorIcono: string;
  ruta: string;
  completado: boolean;
}

const STORAGE_KEY = 'tutorial_estado';
const STORAGE_KEY_VISIBLE = 'tutorial_visible';

@Injectable({
  providedIn: 'root',
})
export class TutorialService {
  pasos = signal<PasoTutorial[]>(this.obtenerPasosIniciales());
  pasoActual = signal<number>(0);
  visible = signal<boolean>(this.obtenerVisibilidadGuardada());

  progreso = computed(() => {
    const lista = this.pasos();
    const completados = lista.filter(p => p.completado).length;
    return lista.length > 0 ? Math.round((completados / lista.length) * 100) : 0;
  });

  tutorialCompletado = computed(() => this.progreso() === 100);

  constructor() {
    this.cargarEstado();
  }

  alternarVisible(): void {
    const nuevoEstado = !this.visible();
    this.visible.set(nuevoEstado);
    localStorage.setItem(STORAGE_KEY_VISIBLE, JSON.stringify(nuevoEstado));
  }

  cerrar(): void {
    this.visible.set(false);
    localStorage.setItem(STORAGE_KEY_VISIBLE, JSON.stringify(false));
  }

  abrir(): void {
    this.visible.set(true);
    localStorage.setItem(STORAGE_KEY_VISIBLE, JSON.stringify(true));
  }

  irAPaso(indice: number): void {
    if (indice >= 0 && indice < this.pasos().length) {
      this.pasoActual.set(indice);
    }
  }

  completarPaso(id: number): void {
    const actualizados = this.pasos().map(p =>
      p.id === id ? { ...p, completado: true } : p
    );
    this.pasos.set(actualizados);
    this.guardarEstado();
  }

  reiniciar(): void {
    const reiniciados = this.pasos().map(p => ({ ...p, completado: false }));
    this.pasos.set(reiniciados);
    this.pasoActual.set(0);
    this.guardarEstado();
  }

  private obtenerPasosIniciales(): PasoTutorial[] {
    return [
      {
        id: 1,
        titulo: 'Configura tu dirección de origen',
        descripcion: 'Define la dirección desde donde salen tus vehículos. Es fundamental para calcular rutas óptimas.',
        icono: 'ki-filled ki-geolocation',
        colorIcono: '#f1416c',
        ruta: '/configuracion',
        completado: false,
      },
      {
        id: 2,
        titulo: 'Registra tus vehículos',
        descripcion: 'Agrega los vehículos de tu flota con su capacidad de peso, volumen y tiempo disponible.',
        icono: 'ki-filled ki-truck',
        colorIcono: '#7239ea',
        ruta: '/administracion/vehiculo/lista',
        completado: false,
      },
      {
        id: 3,
        titulo: 'Define tus zonas de cobertura',
        descripcion: 'Dibuja las franjas geográficas donde operas para agrupar entregas por zona.',
        icono: 'ki-filled ki-map',
        colorIcono: '#f7c74d',
        ruta: '/administracion/franja/lista',
        completado: false,
      },
      {
        id: 4,
        titulo: 'Crea o importa visitas',
        descripcion: 'Agrega las entregas que necesitas realizar. Puedes importarlas desde Excel o crearlas manualmente.',
        icono: 'ki-filled ki-geolocation',
        colorIcono: '#0098d7',
        ruta: '/movimiento/visita/lista',
        completado: false,
      },
      {
        id: 5,
        titulo: 'Asigna visitas a vehículos',
        descripcion: 'Usa el módulo de Rutear para asignar visitas a los vehículos de tu flota y optimizar las rutas.',
        icono: 'ki-filled ki-route',
        colorIcono: '#17c653',
        ruta: '/rutear',
        completado: false,
      },
      {
        id: 6,
        titulo: 'Diseña y aprueba rutas',
        descripcion: 'Revisa los despachos creados, ajusta el orden de las visitas y aprueba las rutas para operación.',
        icono: 'ki-filled ki-design-1',
        colorIcono: '#0098d7',
        ruta: '/diseno-ruta/lista',
        completado: false,
      },
      {
        id: 7,
        titulo: 'Monitorea el tráfico',
        descripcion: 'Supervisa los despachos en tiempo real, controla el avance de entregas y gestiona novedades.',
        icono: 'ki-filled ki-delivery',
        colorIcono: '#575757',
        ruta: '/trafico/lista',
        completado: false,
      },
      {
        id: 8,
        titulo: 'Revisa tu dashboard',
        descripcion: 'Consulta los indicadores de desempeño de tu operación y toma decisiones basadas en datos.',
        icono: 'ki-filled ki-chart-simple',
        colorIcono: '#0098d7',
        ruta: '/dashboard',
        completado: false,
      },
    ];
  }

  private cargarEstado(): void {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const completados: number[] = JSON.parse(guardado);
        const actualizados = this.pasos().map(p => ({
          ...p,
          completado: completados.includes(p.id),
        }));
        this.pasos.set(actualizados);
      }
    } catch {
      // Si falla la lectura, se usan los valores por defecto
    }
  }

  private guardarEstado(): void {
    const completados = this.pasos()
      .filter(p => p.completado)
      .map(p => p.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completados));
  }

  private obtenerVisibilidadGuardada(): boolean {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_VISIBLE);
      if (guardado !== null) {
        return JSON.parse(guardado);
      }
    } catch {
      // valor por defecto
    }
    return true;
  }
}
