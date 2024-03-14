import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarUpdateComponent } from './aprovar-update.component';

describe('AprovarUpdateComponent', () => {
  let component: AprovarUpdateComponent;
  let fixture: ComponentFixture<AprovarUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AprovarUpdateComponent]
    });
    fixture = TestBed.createComponent(AprovarUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
