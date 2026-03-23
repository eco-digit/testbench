import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MeasurementState } from '@enums/measurement-state.enum';

type MeasurementStateKey = keyof typeof MeasurementState;

@Component({
  selector: 'app-custom-stepper',
  templateUrl: './custom-stepper.component.html',
  styleUrls: ['./custom-stepper.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class CustomStepperComponent implements OnChanges {
  @Input() currentState: keyof typeof MeasurementState | undefined;
  currentStep: number = 0;
  state: MeasurementStateKey = 'Unknown';

  steps: (keyof typeof MeasurementState)[] = [
    'QUEUED',
    'STARTED',
    'PREPARE',
    'INSTALL',
    'WORK',
    'COLLECT',
    'CLEANUP',
  ];

  failureStates: (keyof typeof MeasurementState)[] = [
    'FAILED_SUT',
    'FAILED_ARTHUR',
    'ABORTED',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    const newState = changes['currentState']
      ?.currentValue as MeasurementStateKey;
    const previousState = changes['currentState']
      ?.previousValue as MeasurementStateKey;

    if (newState) {
      this.state = newState === 'CREATED' ? 'QUEUED' : newState;

      if (this.failureStates.includes(this.state)) {
        const fallbackState: MeasurementStateKey = previousState ?? 'QUEUED';
        this.currentStep = this.steps.indexOf(fallbackState);
      } else {
        this.currentStep = this.steps.indexOf(this.state);
      }
    }
  }

  isCompleted(index: number): boolean {
    return index < this.currentStep;
  }

  isCurrent(index: number): boolean {
    return index === this.currentStep;
  }

  isFailure(): boolean {
    return this.state === 'FAILED_SUT' || this.state === 'FAILED_ARTHUR';
  }

  isAbort(): boolean {
    return this.state === 'ABORTED';
  }
}
