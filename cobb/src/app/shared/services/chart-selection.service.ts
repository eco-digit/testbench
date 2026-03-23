import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ChartSelectionService {
  private selectedIndexSubject = new BehaviorSubject<number | null>(null);
  selectedIndex$ = this.selectedIndexSubject.asObservable();

  selectIndex(index: number) {
    this.selectedIndexSubject.next(index);
  }

  clearSelection() {
    this.selectedIndexSubject.next(null);
  }
}
