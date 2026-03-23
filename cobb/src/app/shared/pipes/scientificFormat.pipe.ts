import { Pipe, PipeTransform } from '@angular/core';
import { NumberFormatService } from '@services/number-format.service';

@Pipe({
  name: 'scientificFormat',
  standalone: true,
})
export class ScientificFormatPipe implements PipeTransform {
  constructor(private numFmt: NumberFormatService) {}

  transform(value: number, sigDigits = 3): string {
    return this.numFmt.formatYAxisTick(value, sigDigits);
  }
}
