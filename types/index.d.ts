import {Prisma} from "@prisma/client";

const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {roles: {include: {course: true}}}
});

const fetchedCourseArgs = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        roles: {
            include: {
                user: true
            }
        },
        assignments: true
    }
});

export const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: {
            include: {
                author: true,
                scores: true
            }
        }
    }
});

export type Assignment = Prisma.AssignmentGetPayload<{}>;
export type Course = Prisma.CourseGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;
export type Submission = Prisma.SubmissionGetPayload<{}>;
export type Score = Prisma.ScoreGetPayload<{}>;
export type Role = Prisma.RoleGetPayload<{}>;
export type TestCase = Prisma.TestCaseGetPayload<{}>;

export type FetchedUser = Prisma.UserGetPayload<typeof fetchedUserArgs>;
export type FetchedCourse = Prisma.CourseGetPayload<typeof fetchedCourseArgs>;
export type FetchedAssignment = Prisma.AssignmentGetPayload<typeof fetchedAssignmentArgs>;
export type AssignmentWithTier = Assignment & {tier: UserTier};
export type FetchedCourseWithTier = FetchedCourse & {assignments: AssignmentWithTier[]};

export type Commit = {
    files: string[],
    log: string[],
}

export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type UserTier = Tier | "?"
export type TierList = Record<Tier, {name: string, you: boolean}[]>;