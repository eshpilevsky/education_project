import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetCourse } from '../actions/course.actions';
import { Course } from 'src/app/models/course';
import { Injectable } from '@angular/core';

@State<Course>({
  name: 'course',
  defaults: null
})
@Injectable()
export class CourseState {

  @Selector()
  static getCourse(state: Course) {
    return state;
  }

  @Action(SetCourse)
  set({ getState, patchState, setState }: StateContext<Course>, { payload }: SetCourse) {
    const state = getState();
    setState(payload);
  }
}