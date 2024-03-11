import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjusteComponent } from './ajuste.component';

describe('AjusteComponent', () => {
  let component: AjusteComponent;
  let fixture: ComponentFixture<AjusteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjusteComponent]
    });
    fixture = TestBed.createComponent(AjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
