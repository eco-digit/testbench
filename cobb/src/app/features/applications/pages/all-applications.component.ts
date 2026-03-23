import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AllApplicationsTableComponent } from '@features/applications/pages/all-applications-table/all-applications-table.component';
import { MatSelectModule } from '@angular/material/select';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateApplicationComponent } from './create-application/create-application.component';
import { MeasurementService } from '@services/measurement.service';

@Component({
  selector: 'app-applications',
  templateUrl: './all-applications.component.html',
  styleUrl: './all-applications.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatSelectModule,
    CommonModule,
    AllApplicationsTableComponent,
  ],
})
export class AllApplicationsComponent implements OnInit {
  isHelpSidebarOpen = false;

  constructor(
    readonly helpSidebarState: HelpSidebarStateService,
    readonly dialog: MatDialog,
    readonly measurementService: MeasurementService,
  ) {}

  ngOnInit(): void {
    this.helpSidebarState.sidebarOpen$.subscribe((isOpen) => {
      this.isHelpSidebarOpen = isOpen;
    });
  }

  openDialog() {
    this.dialog.open(CreateApplicationComponent);
  }
}
