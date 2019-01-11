import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';
import { LocalStorageService } from 'ngx-localstorage';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let localStorageService: LocalStorageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameComponent ],
      providers: [ LocalStorageService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorageService = new LocalStorageService({prefix: 'store'});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch skier asset', () => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    expect(typeof(component.getSkierAsset())).toEqual('int');
  });
});
