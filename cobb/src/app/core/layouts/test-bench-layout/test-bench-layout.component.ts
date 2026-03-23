import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@core/layouts/header/header.component';
import { SidebarComponent } from '@core/layouts/sidebar/sidebar.component';
import { BreadcrumbComponent } from '@components/breadcrumb/breadcrumb.component';
import { SidebarHelpComponent } from '@core/layouts/sidebar-help/sidebar-help.component';

@Component({
  selector: 'app-test-bench-layout',
  standalone: true,
  templateUrl: './test-bench-layout.component.html',
  styleUrls: ['./test-bench-layout.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    BreadcrumbComponent,
    SidebarHelpComponent,
  ],
})
export class TestBenchLayoutComponent {}
