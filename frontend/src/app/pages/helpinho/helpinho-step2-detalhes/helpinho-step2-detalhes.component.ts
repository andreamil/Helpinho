import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-helpinho-step2-detalhes',
  templateUrl: './helpinho-step2-detalhes.component.html',
  styleUrls: ['./helpinho-step2-detalhes.component.scss']
})
export class HelpinhoStep2DetalhesComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Output() titleChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() imageFileSelected = new EventEmitter<File>();

  imageUrl: string | null = null;
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
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    this.imageFileSelected.emit(this.selectedFile);
  }
}
