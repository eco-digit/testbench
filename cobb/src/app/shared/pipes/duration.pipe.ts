import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(seconds: number | null): string {
    if (seconds === null) return '';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = '';
    if (hrs > 0) {
      result += `${hrs}h `;
    }
    if (mins > 0) {
      result += `${mins}min `;
    }
    if (secs > 0 || (hrs === 0 && mins === 0)) {
      result += `${secs}s `;
    }

    return result;
  }
}
