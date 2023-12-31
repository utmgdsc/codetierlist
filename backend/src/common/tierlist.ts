import {User} from "@prisma/client";
import {
    FullFetchedAssignment,
    Tier,
    Tierlist,
    UserTier
} from "codetierlist-types";
import {isProf} from "./utils";

/** @return a two letter hash of the string */
export const twoLetterHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36).substr(0, 2);
};

/** @return utorid of user if string or user object */
const getUtorid = (user: User | string) => typeof user === "string" ? user : user.utorid;

/** @return true if the user is the same as the utorid or user object */
const isSelf = (user: User | string, utorid: string) => utorid === getUtorid(user);

/** @return user initials based on email */
const getUserInitials = (user: User) =>
    // the idea here is to catch weird names like "c" from erroring out
    `${user.givenName.substring(0, 1)}${user.surname.substring(0, 1)}`;


/** @return the mean of the data */
const getMean = (data: number[]) => data.length === 0 ? 0 : data.reduce((a, b) => Number(a) + Number(b)) / data.length;

function getStandardDeviation(array: number[]) {
    if(array.length===0) {
        return 0;
    }
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

export function generateList(assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User, anonymize = false): [Tierlist, UserTier] {
    const res: Tierlist = {
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
    };
    if (assignment.submissions.length === 0) {
        return [res, "?" as UserTier];
    }
    const scores = assignment.submissions.filter(submission=>!isProf(assignment.course, submission.author)).map(submission =>
    {
        const validScores = submission.scores.filter(x=>x.test_case.valid==="VALID");
        return{
            you: user ? isSelf(user, submission.author.utorid) : false,
            name: getUserInitials(submission.author),
            utorid: anonymize ? '' : submission.author.utorid,
            score: validScores.length === 0 ? 0.0 : validScores.filter(x => x.pass).length / validScores.length
        };}
    );
    const mean = getMean(scores.map(x => x.score));
    const std = getStandardDeviation(scores.map(x => x.score));
    let yourTier: UserTier | undefined = undefined;
    for (const score of scores) {
        let tier: Tier;
        const {score:_, ...scoreNew}=score;
        if (score.score == 0) {
            tier = "F";
        } else if (score.score == 1 || score.score > mean + 2 * std) {
            tier = "S";
        } else if (score.score > mean + std) {
            tier = "A";
        } else if (score.score >= mean) {
            tier = "B";
        } else if (score.score > mean - std) {
            tier = "C";
        } else if (score.score > mean - 2 * std) {
            tier = "D";
        } else {
            tier = "F";
        }
        if (score.you) {
            yourTier = tier;
        }
        res[tier].push(scoreNew);
    }
    if (!yourTier) yourTier = "?";

    return [res, yourTier];
}

export const generateTierList = (assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User, anonymize=true): Tierlist => generateList(assignment, user, anonymize)[0];
export const generateYourTier = (assignment: Omit<FullFetchedAssignment, "due_date">, user?: string | User): UserTier => generateList(assignment, user)[1];
