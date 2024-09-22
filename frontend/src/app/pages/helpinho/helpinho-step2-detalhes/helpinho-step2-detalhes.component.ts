import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-helpinho-step2-detalhes',
  templateUrl: './helpinho-step2-detalhes.component.html',
  styleUrls: ['./helpinho-step2-detalhes.component.scss']
})
export class HelpinhoStep2DetalhesComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() showDetailsError: boolean = false;
  @Input() photoBase64: any = null;
  @Output() titleChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() imageFileSelected = new EventEmitter<File>();
  @Output() photoBase64Change = new EventEmitter<File>();

  selectedFile: File | null = null;

  onTitleChange(newTitle: string) {
    this.title = newTitle;
    this.titleChange.emit(this.title);
  }

  onDescriptionChange(newDescription: string) {
    this.description = newDescription;
    this.descriptionChange.emit(this.description);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoBase64 = e.target.result;
        this.photoBase64Change.emit(this.photoBase64);
      };
      reader.readAsDataURL(file);
    }

    this.imageFileSelected.emit(this.selectedFile);

  }

  isValid(): boolean {
    return this.title.trim() !== '' && this.description.trim() !== '' && this.selectedFile !== null;
  }
}
