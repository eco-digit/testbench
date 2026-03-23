import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private getStyle(): CSSStyleDeclaration {
    return getComputedStyle(document.documentElement);
  }

  getColor(variableName: string): string {
    return this.getStyle().getPropertyValue(variableName).trim();
  }

  get chartColors() {
    return {
      primary: this.getColor('--sys-primary'),
      primary50: this.getColor('--sys-primary-50'),
      primary70: this.getColor('--sys-primary-70'),
      primary16: this.getColor('--sys-layers-primary-opacity16'),
      primaryFix: this.getColor('--sys-on-primary-fixed-variant'),
      secondary: this.getColor('--sys-secondary'),
      tertiary: this.getColor('--sys-tertiary'),
      onSurface: this.getColor('--sys-on-surface'),
      outline: this.getColor('--sys-outline'),
      grid: this.getColor('--sys-surface-container'),
      chartBlue: this.getColor('--sys-chart-blue'),
      chartGreen: this.getColor('--sys-chart-green'),
      chartOrange: this.getColor('--sys-chart-orange'),
      chartPurple: this.getColor('--sys-chart-purple'),
      chartRed: this.getColor('--sys-chart-red'),
    };
  }
}
