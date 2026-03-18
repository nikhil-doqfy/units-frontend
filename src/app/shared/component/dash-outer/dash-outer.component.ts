import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dash-outer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dash-outer.component.html',
  styleUrls: ['./dash-outer.component.css'],
})
export class DashOuterComponent implements OnInit, OnDestroy {
  openSidebarValue = true;
  private subscriptions: Subscription = new Subscription();

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.sharedService.openSidebarValue$.subscribe((value) => {
        this.openSidebarValue = value;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
