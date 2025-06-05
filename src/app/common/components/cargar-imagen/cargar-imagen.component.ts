import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  LoadedImage,
} from 'ngx-image-cropper';

import { Observable } from 'rxjs';
import { General } from '../../clases/general';
import { ModalStandardComponent } from '../ui/modals/modal-standard/modal-standard.component';
import { ModalService } from '../ui/modals/service/modal.service';

@Component({
  selector: 'app-cargar-imagen',
  templateUrl: './cargar-imagen.component.html',
  standalone: true,
  imports: [CommonModule, ModalStandardComponent, ImageCropperComponent],
})
export class CargarImagenComponent extends General implements OnChanges {
  imagenMuyGrande = false
  private _modalService = inject(ModalService)

  constructor(private sanitizer: DomSanitizer) {
    super();
  }

  srcResult: string = '/metronic8/demo1/assets/media/svg/avatars/blank.svg';
  @ViewChild('dialogTemplate') customTemplate!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput !: ElementRef<HTMLInputElement>
  modalRef: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  base64: string | ArrayBuffer = '';
  visualizarRemoverImagen = false;
  @Output() dataFormulario: EventEmitter<any> = new EventEmitter();
  @Output() eliminarLogo: EventEmitter<any> = new EventEmitter();
  @Input() recibirImagen: string | null = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recibirImagen'].currentValue) {
      if(changes['recibirImagen'].currentValue.includes('defecto')){
        this.visualizarRemoverImagen = false;
      } else {
        this.visualizarRemoverImagen = true;
      }
    }
    this.changeDetectorRef.detectChanges()
  }

  archivoSeleccionado(event: any) {
    this.visualizarRemoverImagen = true;
    if (event.target.files.length > 0) {
      this._modalService.open('modal-cargar-imagen')
      this.imageChangedEvent = event;

      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.srcResult = e.target.result;
        };
        reader.readAsDataURL(this.imageChangedEvent.target.files[0]);
      }
      event.target.files = null;
      this.changeDetectorRef.detectChanges();
    }
  }

  removerArchivoSeleccionado() {
    if(this.recibirImagen?.includes('defecto')){
      this.visualizarRemoverImagen = false;
      this.changeDetectorRef.detectChanges()
    }
    this.base64 = '';
    return this.eliminarLogo.emit(true);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    var reader = new FileReader();
    if (event.blob) {
      if(event.blob.size >= 2012490){
        this.imagenMuyGrande = true
      }else {
        this.imagenMuyGrande = false
      }
      const convertedBlob = event.blob.slice(0, event.blob.size, 'image/jpeg');
      reader.readAsDataURL(convertedBlob);
      reader.onloadend = () => {
        if (reader.result) {
          this.base64 = reader.result;
        }
      };
    }

    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(
        event.objectUrl
      );
    }
  }

  imageLoaded(image: LoadedImage) {

  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
  }

  emitirBase64() {
    this.fileInput.nativeElement.value = '';
    this._modalService.close('modal-cargar-imagen')
    this.changeDetectorRef.detectChanges()
    this.dataFormulario.emit(this.base64);
  }

  cerrarModal(){
    this.fileInput.nativeElement.value = '';
    this.base64 = ''
    this.visualizarRemoverImagen = false
    this._modalService.close('modal-cargar-imagen')
  }

  getModalInstaceState(id: string): Observable<boolean> {
    return this._modalService.isOpen$(id)
  }
}

