import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NotificationComponent } from '@components/notification/notification.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@core/auth/auth.service';
import { VersionService } from '@services/version.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    NotificationComponent,
    MatButtonModule,
    RouterModule,
    MatMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  showNotifications = false;

  constructor(
    readonly authService: AuthService,
    readonly versionService: VersionService,
  ) {}

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  logout(): void {
    this.authService.logout();
  }
}
