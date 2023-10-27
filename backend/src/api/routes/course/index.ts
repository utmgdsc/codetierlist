import express from "express";
import prisma, {fetchedAssignmentArgs} from "../../../common/prisma";
import {RoleType} from "@prisma/client";
import assignmentsRoute from "./assignments";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {generateYourTier} from "../../../common/tierlist";
import {fetchCourseMiddleware} from "../../../common/utils";

const router = express.Router();
router.post("/courses", async (req, res) => {
    if (!req.user.admin) {
        res.statusCode = 403;
        res.send({error: 'You are not an admin.'});
        return;
    }
    const {name, code} = req.body;
    if (typeof name !== 'string' || typeof code !== 'string') {
        res.statusCode = 400;
        res.send({error: 'Invalid body.'});
        return;
    }
    const oldCourse = await prisma.course.findFirst({orderBy: {createdAt: "desc"}});
    const courseNumber = oldCourse ? parseInt(oldCourse.id.split('-')[1]) + 1 : 0;
    const id = code + '-' + courseNumber;

    await prisma.course.create({
        data: {
            id,
            name,
            code
        }
    });

    const course = await prisma.course.update({
        where: {id},
        data: {
            roles: {
                create: {
                    user: {connect: {utorid: req.user.utorid}},
                    type: 'INSTRUCTOR'
                }
            }
        }
    });
    res.statusCode = 201;
    res.send(course);
});


router.get("/:courseId", fetchCourseMiddleware, async (req, res) => {
    const course = await prisma.course.findUnique({
        where: {id: req.course!.id},
        include: {roles: true, assignments: fetchedAssignmentArgs},
    });

    const assignments = course!.assignments.map(assignment => ({
        title: assignment.title,
        course_id: assignment.course_id,
        due_date: assignment.due_date,
        tier: generateYourTier(assignment)
    }));

    res.send({
        ...req.course,
        assignments,
    });
});

router.delete("/:courseId", fetchCourseMiddleware, async (req, res) => {
    if (!req.user.admin) {
        res.statusCode = 403;
        res.send({error: 'You are not an admin.'});
        return;
    }
    await prisma.course.delete({where: {id: req.course!.id}});
    res.send({});
});

router.post("/:courseId/enroll", fetchCourseMiddleware, async (req, res) => {
    const {utorids, role}: { utorids: unknown, role?: string } = req.body;
    if (role !== undefined && !(Object.values(RoleType) as string[]).includes(role)) {
        res.statusCode = 400;
        res.send({error: 'Invalid role.'});
        return;
    }
    const newRole = role as RoleType | undefined ?? RoleType.STUDENT;
    if (!utorids || !Array.isArray(utorids) || utorids.some(utorid => typeof utorid !== 'string')) {
        res.statusCode = 400;
        res.send({error: 'utorids must be an array of strings.'});
        return;
    }

    await prisma.role.createMany({
        data: utorids.map(utorid => ({
            type: newRole,
            course_id: req.course!.id,
            user_id: utorid
        })),
        skipDuplicates: true
    });

    res.send({});

});

router.post("/:courseId/assignments", fetchCourseMiddleware, async (req, res) => {
    const {name, dueDate, description} = req.body;
    const date = new Date(dueDate);
    if (typeof name !== 'string' || isNaN(date.getDate()) || typeof description !== 'string' || name.length === 0 || description.length === 0) {
        res.statusCode = 400;
        res.send({error: 'Invalid request.'});
        return;
    }
    try {
        const assignment = await prisma.assignment.create({
            data: {
                title: name,
                due_date: dueDate,
                description,
                course: {connect: {id: req.course!.id}}
            }
        });
        res.statusCode = 201;
        res.send(assignment);
    } catch (e) {
        if ((e as PrismaClientKnownRequestError).code === 'P2002') {
            res.statusCode = 400;
            res.send({error: 'Assignment already exists.'});
        } else {
            throw e;
        }
    }
});

router.use("/:courseId/assignments", assignmentsRoute);

export default router;