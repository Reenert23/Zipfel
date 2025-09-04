import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPlayersComponent } from './select-players.component';

describe('SelectPlayersComponent', () => {
  let component: SelectPlayersComponent;
  let fixture: ComponentFixture<SelectPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectPlayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
