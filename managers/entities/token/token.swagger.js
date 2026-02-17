/**
 * @swagger
 * tags:
 *   - name: Token
 *     description: Token management (exchange long token for short token)
 */

/**
 * @swagger
 * /token/v1_createShortToken:
 *   post:
 *     summary: Create a short token from a long token
 *     description: >
 *       Exchanges a long-lived token for a short-lived token.
 *       The short token includes userId, userKey, role, and device info (sessionId).
 *     tags: [Token]
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Long-lived JWT token
 *       - in: header
 *         name: user-agent
 *         schema:
 *           type: string
 *         required: false
 *         description: User Agent string (used for device/session identification)
 *     responses:
 *       200:
 *         description: Short token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortToken:
 *                   type: string
 *                   description: The generated short-lived token
 *       400:
 *         description: Missing token or invalid request
 *       401:
 *         description: Invalid or expired long token
 *       500:
 *         description: Server error
 */
