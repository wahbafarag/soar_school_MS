/**
 * @swagger
 * tags:
 *   - name: School
 *     description: School management (CRUD operations)
 */

/**
 * @swagger
 * /school/createSchool:
 *   post:
 *     summary: Create a new school
 *     description: Creates a new school. Only accessible by superAdmin.
 *     tags: [School]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: SuperAdmin long token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - schoolEmail
 *               - schoolAddress
 *               - schoolPhone
 *             properties:
 *               schoolName:
 *                 type: string
 *                 example: Cairo International School
 *               schoolEmail:
 *                 type: string
 *                 example: info@cairointernational.edu
 *               schoolAddress:
 *                 type: string
 *                 example: 123 Nile Street, Cairo, Egypt
 *               schoolPhone:
 *                 type: string
 *                 example: "+201234567890"
 *               schoolAdmins:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of User IDs (must have schoolAdmin role). Optional.
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e1"]
 *     responses:
 *       200:
 *         description: School created successfully
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
 *                     school:
 *                       $ref: '#/components/schemas/School'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       409:
 *         description: School already exists (duplicate)
 */

/**
 * @swagger
 * /school/getSchool:
 *   get:
 *     summary: Get a single school by ID
 *     description: >
 *       Retrieves school details. SuperAdmin can view any school.
 *       SchoolAdmin can only view schools they are assigned to.
 *     tags: [School]
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
 *         description: School ID
 *     responses:
 *       200:
 *         description: School retrieved successfully
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
 *                     school:
 *                       $ref: '#/components/schemas/School'
 *       400:
 *         description: Missing school ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – schoolAdmin not assigned to this school
 *       404:
 *         description: School not found
 */

/**
 * @swagger
 * /school/listSchools:
 *   get:
 *     summary: List all schools
 *     description: >
 *       SuperAdmin sees all schools. SchoolAdmin sees only schools they are assigned to.
 *     tags: [School]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long token (superAdmin or schoolAdmin)
 *     responses:
 *       200:
 *         description: List of schools
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
 *                     schools:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/School'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /school/updateSchool:
 *   put:
 *     summary: Update a school
 *     description: Updates school fields. Only accessible by superAdmin.
 *     tags: [School]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: SuperAdmin long token
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
 *                 description: School ID
 *               schoolName:
 *                 type: string
 *                 example: Updated School Name
 *               schoolEmail:
 *                 type: string
 *                 example: updated@school.edu
 *               schoolAddress:
 *                 type: string
 *                 example: 456 New Address St
 *               schoolPhone:
 *                 type: string
 *                 example: "+201111111111"
 *               schoolAdmins:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Replace the full list of school admin IDs (must have schoolAdmin role). Optional.
 *                 example: ["64a1b2c3d4e5f6a7b8c9d0e1"]
 *     responses:
 *       200:
 *         description: School updated successfully
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
 *                     school:
 *                       $ref: '#/components/schemas/School'
 *       400:
 *         description: Validation error or no fields to update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: School not found
 */

/**
 * @swagger
 * /school/deleteSchool:
 *   delete:
 *     summary: Delete a school
 *     description: >
 *       Deletes a school and all students enrolled in it (cascade).
 *       Only accessible by superAdmin.
 *     tags: [School]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: SuperAdmin long token
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
 *                 description: School ID to delete
 *     responses:
 *       200:
 *         description: School deleted successfully
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
 *                       example: school deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: School not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     School:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         schoolName:
 *           type: string
 *         schoolEmail:
 *           type: string
 *         schoolAddress:
 *           type: string
 *         schoolPhone:
 *           type: string
 *         schoolAdmins:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of User IDs assigned as admins
 *         createdAt:
 *           type: string
 *           format: date-time
 */
