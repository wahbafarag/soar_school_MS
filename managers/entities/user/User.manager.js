const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const { allowedTo } = require("../../../helpers/allowedTo");

module.exports = class User {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.httpExposed = ["createSuperAdmin", "createSchoolAdmin", "login"];
  }

  async createSuperAdmin({ __headers, username, password }) {
    // Data validation
    let result = await this.validators.user.createSuperAdmin({
      username,
      password,
    });
    if (result && result.length) return result;

    const existingSuperAdmin = await this.mongomodels.user.findOne({
      role: "superAdmin",
    });
    if (existingSuperAdmin) {
      const token = __headers?.token;
      if (!token) return { error: "unauthorized", code: 401 };
      const decoded = this.tokenManager.verifyLongToken({ token });
      if (!decoded) return { error: "invalid token", code: 401 };
      const authCheck = allowedTo(["superAdmin"], decoded.role);
      if (authCheck) return authCheck;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creation Logic
    let createdUser = await this.mongomodels.user.create({
      username,
      password: hashedPassword,
      role: "superAdmin",
    });

    let longToken = this.tokenManager.genLongToken({
      userId: createdUser._id,
      userKey: nanoid(),
      role: "superAdmin",
    });

    // Response
    return {
      user: createdUser,
      longToken,
    };
  }

  async createSchoolAdmin({ __longToken, username, password }) {
    const __token = __longToken;
    if (!__token) return { error: "unauthorized", code: 401 };
    const authCheck = allowedTo(["superAdmin"], __token.role);
    if (authCheck) return authCheck;

    // Data validation
    let result = await this.validators.user.createSchoolAdmin({
      username,
      password,
    });
    if (result && result.length) return result;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creation Logic
    let createdUser = await this.mongomodels.user.create({
      username,
      password: hashedPassword,
      role: "schoolAdmin",
    });

    let longToken = this.tokenManager.genLongToken({
      userId: createdUser._id,
      userKey: nanoid(),
      role: "schoolAdmin",
    });

    // Response
    return {
      user: createdUser,
      longToken,
    };
  }

  async login({ username, password }) {
    // Data validation
    let result = await this.validators.user.login({ username, password });
    if (result && result.length) return result;

    // Find user by username
    const user = await this.mongomodels.user.findOne({ username });
    if (!user) return { error: "Invalid credentials", code: 401 };

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { error: "Invalid credentials", code: 401 };

    // Generate token
    let longToken = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: nanoid(),
      role: user.role,
    });

    // Response
    return { longToken };
  }
};
