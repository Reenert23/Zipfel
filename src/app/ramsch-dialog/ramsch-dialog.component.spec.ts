import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamschDialogComponent } from './ramsch-dialog.component';

describe('RamschDialogComponent', () => {
  let component: RamschDialogComponent;
  let fixture: ComponentFixture<RamschDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RamschDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RamschDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
