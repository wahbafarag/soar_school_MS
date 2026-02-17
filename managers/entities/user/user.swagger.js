/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User management (superAdmin and schoolAdmin creation, login)
 */

/**
 * @swagger
 * /user/createSuperAdmin:
 *   post:
 *     summary: Create a super admin
 *     description: >
 *       Creates a new superAdmin user. The first superAdmin can be created without
 *       authentication. Subsequent superAdmins require a valid superAdmin token.
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: false
 *         description: SuperAdmin token (required only if a superAdmin already exists)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: SuperAdmin
 *               password:
 *                 type: string
 *                 example: StrongP@ss1
 *     responses:
 *       200:
 *         description: Super admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: superAdmin
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 longToken:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (superAdmin token required when a superAdmin already exists)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/createSchoolAdmin:
 *   post:
 *     summary: Create a school admin
 *     description: Creates a new schoolAdmin user. Requires superAdmin token.
 *     tags: [User]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: SuperAdmin token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: SchoolAdmin1
 *               password:
 *                 type: string
 *                 example: StrongP@ss1
 *     responses:
 *       200:
 *         description: School admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: schoolAdmin
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 longToken:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (must be superAdmin)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login with username and password
 *     description: Authenticates a user and returns a long-lived token.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: SuperAdmin
 *               password:
 *                 type: string
 *                 example: StrongP@ss1
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 longToken:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */
