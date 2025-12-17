import { Component } from '@angular/core';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [],
  templateUrl: './rental.component.html',
  styleUrl: './rental.component.css',
})
export class RentalComponent {
  selectedMonth = 'Nov 2025';

  summaryData = [
    {
      title: 'Total Amount Received',
      amount: 'AED 1,20,573',
      badge: '12% ↑ last month',
      badgeType: 'success',
    },
    {
      title: 'Cheques Approved',
      amount: 'AED 2,20,789',
      badge: '5678 Cheques',
      badgeType: 'success',
    },
    {
      title: 'Cheques Deposited',
      amount: 'AED 20,573',
      badge: '1124 Cheques',
      badgeType: 'warning',
    },
  ];

  chartData = [
    380000, 350000, 310000, 380000, 300000, 350000, 370000, 420000, 280000,
    340000, 410000, 230000,
  ];
}
