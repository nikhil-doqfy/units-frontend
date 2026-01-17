import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SortingIconComponent } from '../icons/sorting-icon/sorting-icon.component';

@Component({
  selector: 'app-email-leads',
  standalone: true,
  imports: [CommonModule, SortingIconComponent],
  templateUrl: './email-leads.component.html',
  styleUrl: './email-leads.component.css',
})
export class EmailLeadsComponent {
  leads = [
    {
      name: 'Rakesh Jadhav',
      status: 'Interested',
      statusClass: 'green',
      message: 'Meeting intent · Anulom Technologies Pvt <> Doqfy | E-Stamping',
      owner: 'Vinayak | 1000 Acc',
      date: 'Sep 9',
      isEmail: true,
    },
    {
      name: 'Dhanasekar Prashanth',
      status: 'Interested',
      statusClass: 'green',
      message:
        'Connection Request · The only ask currently I have is for a Demo with ...',
      owner: 'LinkedIn - Amin',
      date: 'Sep 6',
      isEmail: false,
    },
    {
      name: 'Kshitij Shah',
      status: 'Interested',
      statusClass: 'green',
      message: 'RATNAAFIN <> Doqfy | E-Stamping | E-Signature | Contract ...',
      owner: 'Vinayak | 1000 Acc',
      date: 'Sep 5',
      isEmail: true,
    },
    {
      name: 'Mahendra Kumawat',
      status: 'Not interested',
      statusClass: 'gray',
      message: 'LinkedIn Message · No, thanks',
      owner: 'Vineet 15 July',
      date: 'Aug 30',
      isEmail: false,
    },
    {
      name: 'Harshal Patil',
      status: '',
      statusClass: '',
      message: 'Connection Request · Avalog.com',
      owner: 'Vineet 15 July',
      date: 'Aug 29',
      isEmail: false,
    },
    {
      name: 'Dhiren Panchal',
      status: '',
      statusClass: '',
      message: 'Connection Request · Thanks for letting me know',
      owner: 'LinkedIn - Vinayak',
      date: 'Aug 29',
      isEmail: false,
    },
    {
      name: 'Hemangi Jadhav',
      status: '',
      statusClass: '',
      message: 'LinkedIn Message · No, thank you',
      owner: 'Vineet 15 July',
      date: 'Aug 29',
      isEmail: false,
    },
    {
      name: 'Karthick G',
      status: 'Do not contact',
      statusClass: 'orange',
      message: 'Vayavya Labs Pvt <> Doqfy | E-Stamping | E-Signature ...',
      owner: 'Vinayak | 1000 Acc',
      date: 'Aug 28',
      isEmail: true,
    },
    {
      name: 'Amarsinh Parmar',
      status: '',
      statusClass: '',
      message:
        'Connection Request · Hi, Actually all contract are initiated by our clients only.',
      owner: 'Vineet 15 July',
      date: 'Aug 28',
      isEmail: false,
    },
    {
      name: 'Vidhu J',
      status: '',
      statusClass: '',
      message:
        'LinkedIn Message · Not at the moment, i will come back when there is a requirement',
      owner: 'Vineet 15 July',
      date: 'Aug 26',
      isEmail: false,
    },
    {
      name: 'Ashish Mohan Jha',
      status: '',
      statusClass: '',
      message: 'LinkedIn Message · Thanks for letting me know',
      owner: 'Vineet 15 July',
      date: 'Aug 25',
      isEmail: false,
    },
  ];
}
