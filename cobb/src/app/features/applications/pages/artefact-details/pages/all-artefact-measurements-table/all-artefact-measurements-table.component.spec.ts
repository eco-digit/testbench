import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllArtefactMeasurementsTableComponent } from './all-artefact-measurements-table.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AllArtefactMeasurementsTableComponent', () => {
  let component: AllArtefactMeasurementsTableComponent;
  let fixture: ComponentFixture<AllArtefactMeasurementsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AllArtefactMeasurementsTableComponent,
        HttpClientModule,
        BrowserAnimationsModule,
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            // Mock-Daten für ActivatedRoute
            paramMap: of({ get: () => 'mockValue' }),
            snapshot: { paramMap: { get: () => 'mockValue' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllArtefactMeasurementsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
