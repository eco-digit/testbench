import { Component, EventEmitter, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [MatIcon, MatButton],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.scss',
})
export class ErrorDisplayComponent {
  @Output() refreshRequested = new EventEmitter<void>();

  refresh() {
    this.refreshRequested.emit();
  }
}
