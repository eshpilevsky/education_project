import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherExplanationComponent } from './teacher-explanation.component';

describe('TeacherExplanationComponent', () => {
  let component: TeacherExplanationComponent;
  let fixture: ComponentFixture<TeacherExplanationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherExplanationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherExplanationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
