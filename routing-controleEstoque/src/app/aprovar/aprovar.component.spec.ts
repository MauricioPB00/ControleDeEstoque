import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarComponent } from './aprovar.component';

describe('AprovarComponent', () => {
  let component: AprovarComponent;
  let fixture: ComponentFixture<AprovarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AprovarComponent]
    });
    fixture = TestBed.createComponent(AprovarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
