import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-fileupload-container',
  imports: [CommonModule],
  templateUrl: './fileupload-container.component.html'
})
export class FileUploadContainerComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() description:string = "ファイルをドラッグ&ドロップまたはクリックしてアップロード";
  @Input() accept:string = ".json";
  @Input() disabled:boolean = false;
  @Output() onUpload:EventEmitter<any> = new EventEmitter();
  selectedFile?:File;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith(this.accept)) {
      this.selectedFile = file;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onClickUpload() {
    this.onUpload.emit(this.selectedFile);
  }

  clear() {
    this.selectedFile = undefined;
  }
}