import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetUser } from '../actions/user.actions';
import { User } from 'src/app/models/user';
import { Injectable } from '@angular/core';

@State<User>({
  name: 'user',
  defaults: null
})
@Injectable()
export class UserState {

  @Selector()
  static getUser(state: User) {
    return state;
  }

  @Action(SetUser)
  set({ getState, patchState, setState }: StateContext<User>, { payload }: SetUser) {
    const state = getState();
    setState(payload);
  }
}