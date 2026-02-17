/**
 * @swagger
 * tags:
 *   - name: Classroom
 *     description: Classroom management (CRUD operations)
 */

/**
 * @swagger
 * /classroom/createClassroom:
 *   post:
 *     summary: Create a new classroom
 *     description: Creates a classroom under a school. Accessible by superAdmin or schoolAdmin (of that school).
 *     tags: [Classroom]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long token (superAdmin or schoolAdmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - school
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Class 1-A
 *               school:
 *                 type: string
 *                 description: School ID
 *                 example: "64a1b2c3d4e5f6a7b8c9d0e1"
 *               capacity:
 *                 type: number
 *                 example: 30
 *     responses:
 *       200:
 *         description: Classroom created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     classroom:
 *                       $ref: '#/components/schemas/Classroom'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – not admin of this school
 *       404:
 *         description: School not found
 */

/**
 * @swagger
 * /classroom/getClassroom:
 *   get:
 *     summary: Get a single classroom by ID
 *     description: >
 *       Retrieves classroom details. SuperAdmin can view any classroom.
 *       SchoolAdmin can only view classrooms in their schools.
 *     tags: [Classroom]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long token (superAdmin or schoolAdmin)
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     classroom:
 *                       $ref: '#/components/schemas/Classroom'
 *       400:
 *         description: Missing classroom ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Classroom not found
 */

/**
 * @swagger
 * /classroom/listClassrooms:
 *   get:
 *     summary: List classrooms
 *     description: >
 *       SuperAdmin sees all classrooms (optionally filtered by school).
 *       SchoolAdmin sees only classrooms in their schools.
 *     tags: [Classroom]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long token (superAdmin or schoolAdmin)
 *       - in: query
 *         name: school
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by School ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         required: false
 *         description: Items per page (default 15)
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         required: false
 *         description: Page number (default 1)
 *     responses:
 *       200:
 *         description: List of classrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     classrooms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Classroom'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /classroom/updateClassroom:
 *   put:
 *     summary: Update a classroom
 *     description: Update classroom name or capacity. Accessible by superAdmin or schoolAdmin (of that school).
 *     tags: [Classroom]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long token (superAdmin or schoolAdmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Classroom ID
 *               name:
 *                 type: string
 *                 example: Class 1-B
 *               capacity:
 *                 type: number
 *                 example: 35
 *     responses:
 *       200:
 *         description: Classroom updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     classroom:
 *                       $ref: '#/components/schemas/Classroom'
 *       400:
 *         description: Validation error or no fields to update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Classroom not found
 */

/**
 * @swagger
 * /classroom/deleteClassroom:
 *   delete:
 *     summary: Delete a classroom
 *     description: >
 *       Deletes a classroom. Also removes the classroom reference from all students.
 *       Accessible by superAdmin or schoolAdmin (of that school).
 *     tags: [Classroom]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long token (superAdmin or schoolAdmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom deleted successfully
 *       400:
 *         description: Missing classroom ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Classroom not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Classroom:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         school:
 *           type: string
 *           description: School ObjectId
 *         capacity:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */
