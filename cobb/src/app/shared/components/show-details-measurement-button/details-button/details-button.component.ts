import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-details-button',
  standalone: true,
  imports: [RouterLink, MatButton],
  templateUrl: './details-button.component.html',
})
export class DetailsButtonComponent {
  @Input() applicationId!: string;
  @Input() contextId!: string;
  @Input() elementId!: string;
}
