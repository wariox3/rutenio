import { Injectable, signal, computed, inject } from '@angular/core';
import { driver, DriveStep } from 'driver.js';
import { ModalService } from '../ui/modals/service/modal.service';

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
  private modalService = inject(ModalService);

  pasos = signal<PasoTutorial[]>(this.obtenerPasosIniciales());
  pasoActual = signal<number>(0);
  visible = signal<boolean>(this.obtenerVisibilidadGuardada());
  tourActivo = signal<boolean>(false);

  progreso = computed(() => {
    const lista = this.pasos();
    const completados = lista.filter(p => p.completado).length;
    return lista.length > 0 ? Math.round((completados / lista.length) * 100) : 0;
  });

  tutorialCompletado = computed(() => this.progreso() === 100);

  private toursPorPagina: Record<string, DriveStep[]> = {
    '/configuracion': [
      {
        element: '#tour-config-direccion',
        popover: {
          title: 'Dirección de origen',
          description: 'Busca y selecciona la dirección desde donde salen tus vehículos. Es el punto de partida para calcular todas las rutas.',
        },
      },
      {
        element: '#tour-config-opciones',
        popover: {
          title: 'Opciones de configuración',
          description: 'Activa o desactiva funcionalidades como la sincronización con complementos externos y el ruteo por franjas geográficas.',
        },
      },
      {
        element: '#tour-config-guardar',
        popover: {
          title: 'Guardar configuración',
          description: 'Una vez que hayas configurado tu dirección y opciones, haz clic aquí para guardar los cambios.',
        },
      },
    ],
    '/administracion/vehiculo/lista': [
      {
        element: '#tour-vehiculo-tabla',
        popover: {
          title: 'Lista de vehículos',
          description: 'Aquí verás todos los vehículos registrados en tu flota con su capacidad, tipo y estado.',
        },
      },
      {
        element: '#tour-vehiculo-nuevo',
        popover: {
          title: 'Crear vehículo',
          description: 'Haz clic aquí para registrar un nuevo vehículo indicando su placa, capacidad de peso, volumen y tiempo disponible.',
        },
      },
      {
        element: '#tour-vehiculo-importar',
        popover: {
          title: 'Importar vehículos',
          description: 'Si tienes muchos vehículos, puedes importarlos masivamente desde un archivo Excel.',
        },
      },
    ],
    '/administracion/franja/lista': [
      {
        element: '#tour-franja-lista',
        popover: {
          title: 'Lista de franjas',
          description: 'Estas son tus zonas de cobertura. Cada franja agrupa entregas por área geográfica para optimizar las rutas.',
        },
      },
      {
        element: '#tour-franja-mapa',
        popover: {
          title: 'Mapa de franjas',
          description: 'Visualiza y dibuja tus zonas de cobertura directamente en el mapa. Puedes crear polígonos para definir cada franja.',
        },
      },
      {
        element: '#tour-franja-nuevo',
        popover: {
          title: 'Crear franja',
          description: 'Haz clic aquí para empezar a dibujar una nueva zona de cobertura en el mapa.',
        },
      },
    ],
    '/movimiento/visita/lista': [
      {
        element: '#tour-visita-tabla',
        popover: {
          title: 'Lista de visitas',
          description: 'Aquí se muestran todas las entregas pendientes con su dirección, peso, volumen y estado actual.',
        },
      },
      {
        element: '#tour-visita-nuevo',
        popover: {
          title: 'Crear visita',
          description: 'Agrega manualmente una nueva entrega con todos sus datos: dirección, destinatario, peso y ventana horaria.',
        },
      },
      {
        element: '#tour-visita-importar',
        popover: {
          title: 'Importar visitas',
          description: 'Importa entregas masivamente desde Excel o desde un complemento externo. Ideal cuando tienes muchos pedidos.',
        },
      },
    ],
    '/rutear': [
      {
        element: '#tour-rutear-boton',
        popover: {
          title: 'Botón Rutear',
          description: 'Este es el botón principal. Al hacer clic, el sistema asigna automáticamente las visitas a los vehículos disponibles optimizando las rutas.',
        },
      },
      {
        element: '#tour-rutear-resumen',
        popover: {
          title: 'Resumen de capacidad',
          description: 'Aquí puedes ver las métricas de tu flota: vehículos disponibles, visitas pendientes, capacidad utilizada y tiempo estimado.',
        },
      },
      {
        element: '#tour-rutear-flota',
        popover: {
          title: 'Selección de flota',
          description: 'Selecciona qué flota de vehículos usar para el ruteo. Puedes tener múltiples flotas configuradas.',
        },
      },
    ],
    '/diseno-ruta/lista': [
      {
        element: '#tour-diseno-despachos',
        popover: {
          title: 'Despachos',
          description: 'Lista de despachos creados por el ruteo. Cada despacho agrupa las visitas asignadas a un vehículo específico.',
        },
      },
      {
        element: '#tour-diseno-visitas',
        popover: {
          title: 'Visitas por despacho',
          description: 'Al seleccionar un despacho, aquí verás las visitas asignadas en orden de entrega. Puedes reorganizar el orden arrastrando.',
        },
      },
      {
        element: '#tour-diseno-mapa',
        popover: {
          title: 'Mapa de ruta',
          description: 'Visualiza la ruta del despacho seleccionado en el mapa. Puedes verificar que el recorrido sea lógico antes de aprobarlo.',
        },
      },
    ],
    '/trafico/lista': [
      {
        element: '#tour-trafico-tabla',
        popover: {
          title: 'Tabla de despachos',
          description: 'Supervisa todos los despachos en curso. Puedes ver el progreso de entregas, la ubicación del vehículo y las novedades.',
        },
      },
      {
        element: '#tour-trafico-actualizar',
        popover: {
          title: 'Actualizar datos',
          description: 'Recarga la información de los despachos para ver el estado más reciente del avance de entregas.',
        },
      },
      {
        element: '#tour-trafico-ubicacion',
        popover: {
          title: 'Ubicación actual',
          description: 'Consulta la ubicación en tiempo real de los vehículos en operación para monitorear su avance.',
        },
      },
    ],
    '/dashboard': [
      {
        element: '#tour-dashboard-kpis',
        popover: {
          title: 'Indicadores principales',
          description: 'Consulta los KPIs clave de tu operación: cumplimiento, entregas exitosas, tiempo promedio y más.',
        },
      },
      {
        element: '#tour-dashboard-zonas',
        popover: {
          title: 'Cumplimiento por zona',
          description: 'Analiza el desempeño de entregas desglosado por zona geográfica para identificar áreas de mejora.',
        },
      },
      {
        element: '#tour-dashboard-mapa',
        popover: {
          title: 'Mapa de operación',
          description: 'Visualiza la distribución geográfica de tus entregas y la cobertura de tu operación en el mapa.',
        },
      },
    ],
  };

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

  lanzarTour(ruta: string, pasoId: number): void {
    const pasos = this.toursPorPagina[ruta];
    if (!pasos || pasos.length === 0) return;

    this.cerrar();
    this.tourActivo.set(true);

    this.esperarElementos(pasos).then(pasosVisibles => {
      if (pasosVisibles.length === 0) {
        this.tourActivo.set(false);
        return;
      }

      this.modalService.close('modalConfiguracionDireccion');

      const instancia = driver({
        showProgress: true,
        animate: true,
        overlayColor: '#000000',
        overlayOpacity: 0.6,
        stagePadding: 4,
        stageRadius: 5,
        allowClose: true,
        smoothScroll: true,
        popoverClass: 'rutenio-tour-popover',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar',
        progressText: '{{current}} de {{total}}',
        onDestroyed: () => {
          this.completarPaso(pasoId);
          this.tourActivo.set(false);
        },
        steps: pasosVisibles,
      });

      instancia.drive();
    });
  }

  private esperarElementos(pasos: DriveStep[], intentosMax = 20, intervalo = 200): Promise<DriveStep[]> {
    return new Promise(resolve => {
      let intentos = 0;
      const verificar = () => {
        intentos++;
        const primerElemento = pasos[0]?.element;
        if (primerElemento && document.querySelector(primerElemento as string)) {
          const pasosVisibles = pasos.filter(
            p => !p.element || document.querySelector(p.element as string)
          );
          resolve(pasosVisibles);
          return;
        }
        if (intentos >= intentosMax) {
          resolve([]);
          return;
        }
        setTimeout(verificar, intervalo);
      };
      setTimeout(verificar, 300);
    });
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
