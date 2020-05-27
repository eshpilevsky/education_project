import { environment } from "src/environments/environment";

/**
 * sendable interfaces for communication with the api
 */
export interface SendableTeacherData {
  schooldata: number[];
  subjects: number[];
  verificationFile?: string;
  verified?: boolean;
  profilePicture?: string;
}

export interface SendableStudentData {
  schoolData: number;
}

type GenderAbbr = "М" | "Ж" | "None";

export interface SendableUser {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  state: number;
  termsAccepted: boolean;
  gender: GenderAbbr;
  emailVerified?: boolean;
  studentdata: SendableStudentData | null;
  teacherdata: SendableTeacherData | null;
}

export interface SendableLogin {
  email: string;
  password: string;
}

export interface SendableSchoolData {
  id: number;
  schoolType: number;
  grade: number;
}

/**
 * local objects
 */
export class StudentData {
  constructor(public schoolData: SchoolData) {}
}

export class TeacherData {
  constructor(
    public schooldata: SchoolData[],
    public subjects: Subject[],
    public verificationFile: string,
    public verified: boolean,
    public profilePicture
  ) {}
}

export class User {
  constructor(
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public state: State,
    public studentdata: StudentData | null,
    public teacherdata: TeacherData | null,
    public termsAccepted: boolean,
    public emailVerified: boolean,
    public gender: Gender,
    public token: string,
    public tokenExpiry: string
  ) {}

  isStudent(): boolean {
    return !this.studentdata === null;
  }
}

export class State {
  constructor(
    public id: number,
    public name: string,
    public shortcode: string
  ) {}
}

export class Subject {
  constructor(public id: number, public name: string) {}
}
export class SchoolType {
  constructor(public id: number, public name: string) {}
}

export class SchoolData {
  constructor(
    public id: number,
    public schoolType: SchoolType,
    public grade: number
  ) {}
}

export class Gender {
  constructor(
    public id: number,
    public gender: string,
    public shortcode: GenderAbbr
  ) {}
}

/**
 *  conversion functions between User <==> SendableUser
 */
export function localToSendableUser(user: User): SendableUser {
  const studentdata: SendableStudentData | null = user.studentdata
    ? {
        schoolData: user.studentdata.schoolData.id,
      }
    : null;
  const teacherdata: SendableTeacherData | null = user.teacherdata
    ? {
        schooldata: user.teacherdata.schooldata.map((x) => x.id),
        subjects: user.teacherdata.subjects.map((x) => x.id),
        verificationFile: user.teacherdata.verificationFile,
        verified: user.teacherdata.verified,
        profilePicture: user.teacherdata.profilePicture,
      }
    : null;
  return {
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    state: user.state.id,
    gender: user.gender.shortcode,
    emailVerified: user.emailVerified,
    studentdata: studentdata,
    teacherdata: teacherdata,
    termsAccepted: user.termsAccepted,
  };
}
export function sendableToLocalUser(
  user: SendableUser,
  constants: Constants
): User {
  return new User(
    user.email,
    user.password,
    user.firstName,
    user.lastName,
    constants.states.find((x) => x.id === user.state),
    user.studentdata
      ? new StudentData(
          constants.schoolData.find(
            (x) => x.id === user.studentdata.schoolData
          )
        )
      : null,
    user.teacherdata
      ? new TeacherData(
          constants.schoolData.filter((x) =>
            user.teacherdata.schooldata.includes(x.id)
          ),
          constants.subjects.filter((x) =>
            user.teacherdata.subjects.includes(x.id)
          ),
          user.teacherdata.verificationFile,
          user.teacherdata.verified,
          user.teacherdata.profilePicture
        )
      : null,
    user.termsAccepted,
    user.emailVerified,
    constants.genders.find((x) => x.shortcode === user.gender),
    // need to provide token / token_expiry via login
    "",
    ""
  );
}

export function localToSendableSchoolData(s: SchoolData): SendableSchoolData {
  return {
    id: s.id,
    schoolType: s.schoolType.id,
    grade: s.grade,
  };
}

export function sendableToLocalSchoolData(
  s: SendableSchoolData,
  types: SchoolType[]
): SchoolData {
  return new SchoolData(
    s.id,
    types.find((t) => t.id === s.schoolType),
    s.grade
  );
}

const addAPIUrl = (url: string) => environment.apiUrl + url;
const removeAPIUrl = (url: string) => url.replace(environment.apiUrl, "");

export class Constants {
  constructor(
    public states: State[],
    public subjects: Subject[],
    public schoolTypes: SchoolType[],
    public schoolData: SchoolData[],
    public genders: Gender[]
  ) {}
}
