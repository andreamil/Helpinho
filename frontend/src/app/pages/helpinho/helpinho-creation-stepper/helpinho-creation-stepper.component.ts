import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HelpinhoService } from '../../../services/helpinho.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-helpinho-creation-stepper',
  templateUrl: './helpinho-creation-stepper.component.html',
  styleUrls: ['./helpinho-creation-stepper.component.scss']
})
export class HelpinhoCreationStepperComponent {
  currentStep: number = 0;
  isLoading: boolean = false;

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
    isUrgent: false,
    goal: 0,
    customGoal: null as number | null,
    deadline: null as string | null,
    imageFile: null as File | null,
    photoBase64: '',
    bankInfo: { accountNumber: '', agency: '', bankName: '' }
  };

  showCategoryError: boolean = false;
  showDetailsError: boolean = false;
  showGoalError: boolean = false;
  showDeadlineError: boolean = false;

  constructor(
    private helpinhoService: HelpinhoService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.helpinhoData.category.trim() !== '';
      case 1:
        return this.helpinhoData.title.trim() !== '' && this.helpinhoData.description.trim() !== '' && this.helpinhoData.imageFile !== null;
      case 2:
        return (this.helpinhoData.goal > 0 || this.helpinhoData.customGoal !== null) && this.helpinhoData.deadline !== null;
      default:
        return true;
    }
  }

  handleStepValidation() {
    this.showCategoryError = false;
    this.showDetailsError = false;
    this.showGoalError = false;
    this.showDeadlineError = false;

    if (!this.isStepValid()) {
      switch (this.currentStep) {
        case 0:
          this.showCategoryError = true;
          this.toastr.error('Selecione uma categoria.', 'Erro');
          break;
        case 1:
          this.showDetailsError = true;
          this.toastr.error('Preencha o título, descrição e selecione uma imagem.', 'Erro');
          break;
        case 2:
          this.showGoalError = true;
          this.showDeadlineError = true;
          this.toastr.error('Defina uma meta válida e um prazo.', 'Erro');
          break;
      }
    }
  }

  nextStep() {
    this.handleStepValidation();
    if (this.isStepValid()) {
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

  publishHelpinho() {
    this.handleStepValidation();
    if (this.isStepValid()) {
      this.isLoading = true;
      this.helpinhoService.createHelpinho(this.helpinhoData).subscribe(
        (res) => {
          this.router.navigate(['/']);
          this.toastr.success('Helpinho criado com sucesso!', 'Sucesso');
          this.isLoading = false;
        },
        (error) => {
          console.error('Erro ao criar o Helpinho:', error);
          this.toastr.error('Ocorreu um erro ao criar o Helpinho.', 'Erro');
          this.isLoading = false;
        }
      );
    }
  }
}
