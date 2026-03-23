import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDrawer,
  MatDrawerContainer,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sidebar-help',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDrawerContainer,
    MatSidenavModule,
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar-help.component.html',
  styleUrl: './sidebar-help.component.scss',
})
export class SidebarHelpComponent {
  constructor(readonly helpSidebarState: HelpSidebarStateService) {}

  readonly panelOpenState = signal(false);

  toggleDrawer(drawer: MatDrawer) {
    this.helpSidebarState.setSidebarOpen(!drawer.opened);
    drawer.toggle();
  }
}
