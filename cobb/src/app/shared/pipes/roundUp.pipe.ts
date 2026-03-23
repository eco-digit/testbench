import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundUp',
  standalone: true,
})
export class RoundUpPipe implements PipeTransform {
  transform(value: number, decimals: number): number | undefined {
    const factor = Math.pow(10, decimals);
    return Math.ceil(value * factor) / factor;
  }
}
