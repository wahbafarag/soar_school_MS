/**
 * @swagger
 * tags:
 *   - name: Student
 *     description: Student management (CRUD operations)
 */

/**
 * @swagger
 * /student/createStudent:
 *   post:
 *     summary: Create a new student
 *     description: >
 *       Creates a new student enrolled in a school.
 *       SuperAdmin can create students in any school.
 *       SchoolAdmin can only create students in schools they are assigned to.
 *     tags: [Student]
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
 *               - studentName
 *               - studentBirth
 *               - school
 *             properties:
 *               studentName:
 *                 type: string
 *                 example: Ahmed Mohamed
 *               studentBirth:
 *                 type: string
 *                 format: date
 *                 example: "2010-05-15"
 *               school:
 *                 type: string
 *                 description: School ID to enroll the student in
 *               studentPic:
 *                 type: string
 *                 description: URL to student picture (optional)
 *               classrooms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Classroom IDs (must belong to the same school). Optional.
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e1"]
 *     responses:
 *       200:
 *         description: Student created successfully
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – schoolAdmin not assigned to this school
 *       404:
 *         description: School not found
 */

/**
 * @swagger
 * /student/getStudent:
 *   get:
 *     summary: Get a single student by ID
 *     description: >
 *       Retrieves student details with populated school info.
 *       SuperAdmin can view any student.
 *       SchoolAdmin can only view students in their assigned schools.
 *     tags: [Student]
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
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Missing student ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – schoolAdmin not assigned to this student's school
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /student/listStudents:
 *   get:
 *     summary: List students
 *     description: >
 *       SuperAdmin sees all students (optionally filtered by school).
 *       SchoolAdmin sees only students in their assigned schools.
 *     tags: [Student]
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
 *         description: Filter by School ID (optional)
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
 *         description: List of students
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
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – schoolAdmin not assigned to the filtered school
 */

/**
 * @swagger
 * /student/updateStudent:
 *   put:
 *     summary: Update a student
 *     description: >
 *       Updates student fields (name, birth, pic, classrooms).
 *       To change the student's school use the transferStudent endpoint instead.
 *       SuperAdmin can update any student.
 *       SchoolAdmin can only update students in their assigned schools.
 *     tags: [Student]
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
 *                 description: Student ID
 *               studentName:
 *                 type: string
 *                 example: Ahmed Updated
 *               studentBirth:
 *                 type: string
 *                 format: date
 *                 example: "2010-06-20"
 *               studentPic:
 *                 type: string
 *                 description: Updated picture URL
 *               classrooms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Replace the full list of Classroom IDs (must belong to the student's school). Optional.
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e1"]
 *     responses:
 *       200:
 *         description: Student updated successfully
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error or no fields to update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /student/transferStudent:
 *   put:
 *     summary: Transfer a student to another school
 *     description: >
 *       Transfers a student to a different school and empties their classrooms array.
 *       After transfer, use updateStudent to assign new classrooms.
 *       SchoolAdmin must be admin of both the current and target school.
 *     tags: [Student]
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
 *               - school
 *             properties:
 *               id:
 *                 type: string
 *                 description: Student ID to transfer
 *               school:
 *                 type: string
 *                 description: Target School ID
 *     responses:
 *       200:
 *         description: Student transferred successfully
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Student already belongs to this school
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – not admin of current or target school
 *       404:
 *         description: Student or target school not found
 */

/**
 * @swagger
 * /student/deleteStudent:
 *   delete:
 *     summary: Delete a student
 *     description: >
 *       Deletes a student. SuperAdmin can delete any student.
 *       SchoolAdmin can only delete students in their assigned schools.
 *     tags: [Student]
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
 *                 description: Student ID to delete
 *     responses:
 *       200:
 *         description: Student deleted successfully
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
 *                     message:
 *                       type: string
 *                       example: student deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         studentName:
 *           type: string
 *         studentBirth:
 *           type: string
 *           format: date-time
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *         studentPic:
 *           type: string
 *         school:
 *           type: string
 *           description: School ID (or populated school object)
 *         classrooms:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Classroom IDs
 *         createdAt:
 *           type: string
 *           format: date-time
 */
