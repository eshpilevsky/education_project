import { User } from 'src/app/models/user';

export class SetUser {
  static readonly type = '[User] Set';

  constructor(public payload: User) { }
}