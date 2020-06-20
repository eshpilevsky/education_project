import { Course } from 'src/app/models/course';

export class SetCourse {
  static readonly type = '[Course] Set';

  constructor(public payload: Course) { }
}