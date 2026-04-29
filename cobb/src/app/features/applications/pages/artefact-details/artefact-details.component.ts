import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatMiniFabButton } from '@angular/material/button';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteArtefactComponent } from '@features/applications/pages/artefact-details/delete-artefact/delete-artefact.component';
import { MatTableModule } from '@angular/material/table';
import { ArtefactsService } from '@features/applications/services/artefact.service';
import { AllArtefactMeasurementsTableComponent } from '@features/applications/pages/artefact-details/pages/all-artefact-measurements-table/all-artefact-measurements-table.component';

@Component({
  selector: 'app-artefact-details',
  standalone: true,
  imports: [
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMiniFabButton,
    MatTab,
    MatTabGroup,
    MatTableModule,
    CommonModule,
    MatMenuTrigger,
    AllArtefactMeasurementsTableComponent,
  ],
  templateUrl: './artefact-details.component.html',
  styleUrl: './artefact-details.component.scss',
})
export class ArtefactDetailsComponent implements OnInit {
  isHelpSidebarOpen = false;

  selectedTabIndex = 0;
  applicationId!: string;
  contextId!: string;
  artefactId!: string;
  fileName?: string;
  measurementCount?: number;

  @ViewChild('measurementsArtefactTable')
  allArtefactMeasurementsTableComponent!: AllArtefactMeasurementsTableComponent;

  constructor(
    private helpSidebarState: HelpSidebarStateService,
    private artefactsService: ArtefactsService,
    private route: ActivatedRoute,
    readonly router: Router,
    readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const artefactId = this.route.snapshot.paramMap.get('artefactId');
    if (!artefactId) {
      console.error('artefactId is undefined');
      return;
    }
    this.artefactId = artefactId;
    this.contextId =
      this.route.parent?.snapshot.paramMap.get('contextId') ?? '';
    this.applicationId =
      this.route.parent?.parent?.snapshot.paramMap.get('applicationId') ?? '';
    this.artefactsService
      .getArtefactById(this.artefactId)
      .subscribe((artefact) => {
        this.fileName = artefact.originalFileName;
      });
  }

  openDeleteArtefactDialog(): void {
    this.dialog.open(DeleteArtefactComponent, {
      panelClass: 'dialog-delete-container',
      data: {
        artefactId: this.artefactId,
        applicationId: this.applicationId,
        contextId: this.contextId,
      },
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;

    this.helpSidebarState.sidebarOpen$.subscribe((isOpen) => {
      this.isHelpSidebarOpen = isOpen;
    });
  }
}
