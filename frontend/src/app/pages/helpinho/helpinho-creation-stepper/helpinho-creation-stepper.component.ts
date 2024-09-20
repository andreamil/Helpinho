import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HelpinhoService } from '../../../services/helpinho.service';

@Component({
  selector: 'app-helpinho-creation-stepper',
  templateUrl: './helpinho-creation-stepper.component.html',
  styleUrls: ['./helpinho-creation-stepper.component.scss']
})
export class HelpinhoCreationStepperComponent {
  currentStep: number = 0;


  steps = [
    { label: 'Categoria do helpinho', icon: 'category' },
    { label: 'Conhecendo o helpinho', icon: 'details' },
    { label: 'Metas do helpinho', icon: 'goals' },
    { label: 'Revisando', icon: 'review' }
  ];

  helpinhoData = {
    category: '',
    title: '',
    description: '',
    goal: 0,
    imageFile: null as File | null
  };

  constructor(private helpinhoService: HelpinhoService, private router: Router) {}

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onImageFileSelected(file: File) {
    this.helpinhoData.imageFile = file;
  }

  onTitleChange(newTitle: string) {
    this.helpinhoData.title = newTitle;
  }

  onDescriptionChange(newDescription: string) {
    this.helpinhoData.description = newDescription;
  }

  publishHelpinho() {
    this.helpinhoService.createHelpinho(this.helpinhoData).subscribe(
      (res) => {
        this.router.navigate(['/']);
        alert('Helpinho criado com sucesso!');
      },
      (error) => {
        console.error('Erro ao criar o Helpinho:', error);
        alert('Ocorreu um erro ao criar o Helpinho.');
      }
    );
  }
}
