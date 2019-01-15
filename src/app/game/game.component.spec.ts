import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';


describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch skier asset', () => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    expect(typeof(component.getSkierAsset())).toEqual('string');
  });

  it('should fetch skier direction', () => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    expect(typeof(component.skier.direction)).toBe('number');
  });

});
