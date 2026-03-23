import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatDialog } from '@angular/material/dialog';
import { DashboardEcoInsightComponent } from '@features/dashboard/pages/dashboard-eco-insight/dashboard-eco-insight.component';
import { DashboardApplicationComponent } from '@features/dashboard/pages/dashboard-application/dashboard-application.component';
import { CreateApplicationComponent } from '@features/applications/pages/create-application/create-application.component';
import { ChartSelectionService } from '@services/chart-selection.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIcon,
    DashboardEcoInsightComponent,
    DashboardApplicationComponent,
  ],
  providers: [ChartSelectionService],
})
export class DashboardComponent implements OnInit {
  isHelpSidebarOpen: boolean = false;

  constructor(
    readonly helpSidebarState: HelpSidebarStateService,
    readonly dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.helpSidebarState.sidebarOpen$.subscribe((isOpen) => {
      this.isHelpSidebarOpen = isOpen;
    });
  }

  openDialog() {
    this.dialog.open(CreateApplicationComponent, {
      panelClass: 'dialog-create-app',
    });
  }
}
