import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scoreFormatterPipe',
  standalone: true,
})
export class ScoreFormatterPipe implements PipeTransform {
  transform(value: number): number | string {
    if (value !== undefined && value !== null) {
      return Math.round(value);
    } else {
      return '-';
    }
  }
}
