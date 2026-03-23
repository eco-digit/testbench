import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMeasurementsTableComponent } from './all-measurements-table.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AllMeasurementsComponent', () => {
  let component: AllMeasurementsTableComponent;
  let fixture: ComponentFixture<AllMeasurementsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AllMeasurementsTableComponent,
        HttpClientModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}), // Mock für die `params`-Observable
            queryParams: of({}), // Mock für die `queryParams`-Observable
            snapshot: { paramMap: { get: () => null } }, // Mock für `snapshot`
          },
        },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllMeasurementsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
