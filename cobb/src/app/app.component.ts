import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { TestBenchLayoutComponent } from '@core/layouts/test-bench-layout/test-bench-layout.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [TestBenchLayoutComponent],
})
export class AppComponent {
  jestTestTitle = 'jest-setup-is-working';
  constructor(private matIconRegistry: MatIconRegistry) {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
