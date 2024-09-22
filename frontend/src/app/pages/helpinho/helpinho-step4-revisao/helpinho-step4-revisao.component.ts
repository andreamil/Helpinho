import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-helpinho-step4-revisao',
  templateUrl: './helpinho-step4-revisao.component.html',
  styleUrls: ['./helpinho-step4-revisao.component.scss']
})
export class HelpinhoStep4RevisaoComponent implements OnInit {
  @Input() helpinhoData: any;

  donors: any[] = [];
  receivedAmount: number = 0;

  ngOnInit() {
    this.generateRandomDonors();
    this.receivedAmount = this.generateRandomAmount();
    console.log(this.helpinhoData)
  }

  generateRandomDonors() {
    this.donors = [
      {
        name: 'Carlos Silva',
        email: 'carlos@example.com',
        photo: 'https://randomuser.me/api/portraits/men/45.jpg',
        donationAmount: this.getRandomDonation(),
      },
      {
        name: 'Maria Souza',
        email: 'maria@example.com',
        photo: 'https://randomuser.me/api/portraits/women/42.jpg',
        donationAmount: this.getRandomDonation(),
      },
      {
        name: 'Joana Fernandes',
        email: 'joana@example.com',
        photo: 'https://randomuser.me/api/portraits/women/43.jpg',
        donationAmount: this.getRandomDonation(),
      },
    ];
  }

  getRandomDonation(): number {
    return Math.round(Math.floor(Math.random() * (this.helpinhoData.goal||200)/6) + (this.helpinhoData.goal||50)/12); // Valor entre 50 e 250
  }

  generateRandomAmount(): number {
    return this.donors.reduce((total, donor) => total + donor.donationAmount, 0);
  }
}
