import {
  SendableUser,
  User,
  localToSendableUser,
  sendableToLocalUser,
  Constants,
  Subject,
} from "./database";

export interface SendableMatch {
  uuid: string;
  studentAgree: boolean;
  teacherAgree: boolean;
  teacher: SendableUser;
  student: SendableUser;
  failedMatches: number[];
  created: string;
  user: string;
  subject: number
}

export interface SendableMatchRequest {
  match?: SendableMatch;
  failedMatches?: number[];
  created?: string;
}

export interface SendableStudentRequest extends SendableMatchRequest {
  subject: number;
}

export interface SendableMatchAnswer {
  agree: boolean;
}

export interface Meeting {
  meetingId?: string;
  ended?: boolean;
  timeEnded?: string;
  student?: string;
  teacher?: string;
  name: string;
  feedbackSet: number[];
}

export interface JoinResponse {
  joinUrl: string;
}

export interface Feedback {
  receiver?: string;
  provider?: string;
  rating: number;
  message?: string;
  meeting: string;
  created?: string;
}

export class Report {
  meeting: string;
  message: string;
}

export class Match {
  constructor(
    public uuid: string,
    public studentAgree: boolean,
    public teacherAgree: boolean,
    public teacher: User,
    public student: User,
    public failedMatches: number[],
    public created: string,
    public user: string,
    public subject: Subject
  ) {}

  bothAccepted() {
    return this.teacherAgree && this.studentAgree;
  }

  // TODO: this is WIP
  equals(m: Match) {
    return (
      this.uuid === m.uuid &&
      this.studentAgree === m.studentAgree &&
      this.teacherAgree === m.teacherAgree
    );
  }
}

export class MatchRequest {
  constructor(
    public match?: Match,
    public failedMatches?: number[],
    public created?: string
  ) {}

  // TODO: this is untested
  equals(mr: MatchRequest): boolean {
    if (
      this.match === null &&
      mr.match === null &&
      this.created === mr.created
    ) {
      return true;
    }
    if (this.match && mr.match) {
      return this.match.equals(mr.match) && this.created === mr.created;
    }
    return false;
  }
}

export class StudentRequest extends MatchRequest {
  constructor(
    public subject: number,
    public match?: Match,
    public failedMatches?: number[],
    public created?: string
  ) {
    super(match, failedMatches, created);
  }
}

export class MatchAnswer {
  constructor(public agree: boolean) {}
}

/**
 * Conversion functions
 */

export function localToSendableMatch(m: Match): SendableMatch {
  return {
    uuid: m.uuid,
    studentAgree: m.studentAgree,
    teacherAgree: m.teacherAgree,
    teacher: m.teacher ? localToSendableUser(m.teacher) : undefined,
    student: m.student ? localToSendableUser(m.student) : undefined,
    failedMatches: m.failedMatches,
    created: m.created,
    user: m.user,
    subject: m.subject.id
  };
}

export function sendableToLocalMatch(
  m: SendableMatch,
  constants: Constants
): Match {
  return new Match(
    m.uuid,
    m.studentAgree,
    m.teacherAgree,
    m.teacher ? sendableToLocalUser(m.teacher, constants) : null,
    m.student ? sendableToLocalUser(m.student, constants) : null,
    m.failedMatches,
    m.created,
    m.user,
    m.subject ? constants.subjects.find((x) => x.id === m.subject) : null
  );
}

export function localToSendableMatchRequest(
  m: MatchRequest
): SendableMatchRequest {
  return {
    match: m.match ? localToSendableMatch(m.match) : undefined,
    failedMatches: m.failedMatches,
    created: m.created,
  };
}

export function sendableToLocalMatchRequest(
  m: SendableMatchRequest,
  constants: Constants
): MatchRequest {
  return new MatchRequest(
    m.match ? sendableToLocalMatch(m.match, constants) : null,
    m.failedMatches,
    m.created
  );
}

export function localToSendableStudentRequest(
  m: StudentRequest
): SendableStudentRequest {
  return {
    subject: m.subject,
    match: m.match ? localToSendableMatch(m.match) : undefined,
    failedMatches: m.failedMatches,
    created: m.created,
  };
}

export function sendableToLocalStudentRequest(
  m: SendableStudentRequest,
  constants: Constants
): StudentRequest {
  return new StudentRequest(
    m.subject,
    m.match ? sendableToLocalMatch(m.match, constants) : null,
    m.failedMatches,
    m.created
  );
}

export function sendableToLocalMatchAnswer(
  m: SendableMatchAnswer
): MatchAnswer {
  return new MatchAnswer(m.agree);
}

export function localToSendableMatchAnswer(
  m: MatchAnswer
): SendableMatchAnswer {
  return {
    agree: m.agree,
  };
}
