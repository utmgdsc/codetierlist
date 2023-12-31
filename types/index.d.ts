import {Prisma} from "@prisma/client";

export const fetchedUserArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
        roles: {
            where: {
                course:{
                    hidden: false
                }
            },
            include: {
                course: true
            }
        }
    }
});


export const fetchedCourseArgs = Prisma.validator<Prisma.CourseDefaultArgs>()({
    include: {
        roles: {
            include: {
                user: true
            }
        },
        assignments: {
            where: {
                hidden: false
            }
        }
    }
});

const fetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: true,
        test_cases: true
    }
});

const fullFetchedAssignmentArgs = Prisma.validator<Prisma.AssignmentDefaultArgs>()({
    include: {
        submissions: {
            distinct: "author_id",
            orderBy: {datetime: "desc"},
            include: {
                author: true,
                scores: {
                    orderBy: [{test_case: {datetime: "desc"}}, {datetime: "desc"}],
                    distinct: "testcase_author_id",
                    include: {test_case: true}
                }
            }
        },
        course: {
            include: {
                roles: {
                    include: {
                        user: true
                    }
                }
            }
        }
    }
});

export type Assignment = Omit<Prisma.AssignmentGetPayload<{}>, "due_date"> & {
    due_date?: string
};
export type Course = Prisma.CourseGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;
export type Submission = Prisma.SolutionGetPayload<{}>;
export type Score = Prisma.ScoreGetPayload<{}>;
export type Role = Prisma.RoleGetPayload<{}>;
export type TestCase = Prisma.TestCaseGetPayload<{}>;
const test: TestCase;
export type TestCaseStatus = typeof test.valid

export type FetchedUser = Prisma.UserGetPayload<typeof fetchedUserArgs>;
export type FetchedCourse = Prisma.CourseGetPayload<typeof fetchedCourseArgs>;
export type FetchedAssignment =
    Omit<Prisma.AssignmentGetPayload<typeof fetchedAssignmentArgs>, "due_date">
    & { due_date?: string };
export type FullFetchedAssignment = Prisma.AssignmentGetPayload<typeof fullFetchedAssignmentArgs>;
export type AssignmentWithTier = Assignment & { tier: UserTier };
export type FetchedAssignmentWithTier = FetchedAssignment & { tier: UserTier };
export type FetchedCourseWithTiers = Omit<FetchedCourse, "assignments"> & {
    assignments: AssignmentWithTier[]
};

export type Commit = {
    files: string[],
    valid?: TestCaseStatus,
    log: string[],
}

export type Tier = "S" | "A" | "B" | "C" | "D" | "F";
export type UserTier = Tier | "?"
export type TierlistEntry = { name: string, you: boolean, utorid: string }
export type Tierlist = Record<Tier, TierlistEntry[]>;

export type Session = "Fall" | "Winter" | "Summer"

const role: Role;
export type RoleType = typeof role.type

const user: User;
export type Theme = typeof user.theme;

export type RunnerImage = { image: string, image_version: string }

export type AssignmentStudentStats = (Omit<User, "admin" | "theme"> & {
    tier: Tier,
    testsPassed: number,
    totalTests: number,
})[]
