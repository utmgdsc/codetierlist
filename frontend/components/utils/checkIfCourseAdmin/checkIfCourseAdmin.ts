import { FetchedUser } from 'codetierlist-types';

/**
 * Check if a user has administrator privileges in a course
 *
 * @param user The user to check
 * @param courseId The course to check
 * @returns true if the user is an admin or has a role in the course
 */
export const checkIfCourseAdmin = (user: FetchedUser, courseId: string) => {
    return user.roles.some((role) => role.course_id === courseId) || user.admin;
};
