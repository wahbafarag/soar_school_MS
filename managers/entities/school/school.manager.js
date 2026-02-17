const { allowedTo } = require("../../../helpers/allowedTo");

module.exports = class School {
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
    this.httpExposed = [
      "createSchool",
      "get=getSchool",
      "get=listSchools",
      "put=updateSchool",
      "delete=deleteSchool",
    ];
  }

  async createSchool({
    __longToken,
    schoolName,
    schoolEmail,
    schoolAddress,
    schoolPhone,
    schoolAdmins,
  }) {
    if (!__longToken) return { error: "unauthorized", code: 401 };
    const authCheck = allowedTo(["superAdmin"], __longToken.role);
    if (authCheck) return authCheck;

    // Input Validation
    const result = await this.validators.school.createSchool({
      schoolName,
      schoolEmail,
      schoolAddress,
      schoolPhone,
    });
    if (result && result.length) return { errors: result, code: 400 };

    // Validate schoolAdmins if provided
    let validAdminIds = [];
    if (
      schoolAdmins &&
      Array.isArray(schoolAdmins) &&
      schoolAdmins.length > 0
    ) {
      const admins = await this.mongomodels.user.find({
        _id: { $in: schoolAdmins },
        role: "schoolAdmin",
      });
      if (admins.length !== schoolAdmins.length) {
        return {
          error:
            "One or more school admins IDs are invalid or not schoolAdmin role",
          code: 400,
        };
      }
      validAdminIds = schoolAdmins;
    }

    try {
      const createdSchool = await this.mongomodels.school.create({
        schoolName,
        schoolEmail,
        schoolAddress,
        schoolPhone,
        schoolAdmins: validAdminIds,
      });
      return { school: createdSchool };
    } catch (err) {
      if (err.code === 11000)
        return { error: "School with the same info already exists", code: 409 };
      return { error: "School Creation Failed", code: 500 };
    }
  }

  async getSchool({ __longToken, __query }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    const id = __query?.id;
    if (!id) return { error: "School ID is required", code: 400 };

    const school = await this.mongomodels.school
      .findById(id)
      .populate("schoolAdmins", "username role");
    if (!school) return { error: "School not found", code: 404 };

    // admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = school.schoolAdmins.some(
        (admin) => admin._id.toString() === __longToken.userId,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to view this school",
          code: 403,
        };
    }

    return { school };
  }

  async listSchools({ __longToken, __query }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    let schools;
    if (__longToken.role === "schoolAdmin") {
      schools = await this.mongomodels.school
        .find({ schoolAdmins: __longToken.userId })
        .populate("schoolAdmins", "username role");
    } else {
      schools = await this.mongomodels.school
        .find()
        .populate("schoolAdmins", "username role");
    }

    return { schools };
  }

  async updateSchool({
    __longToken,
    id,
    schoolName,
    schoolEmail,
    schoolAddress,
    schoolPhone,
    schoolAdmins,
  }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(["superAdmin"], __longToken.role);
    if (authCheck) return authCheck;

    if (!id) return { error: "School ID is required", code: 400 };

    const updateData = {};
    if (schoolName !== undefined) updateData.schoolName = schoolName;
    if (schoolEmail !== undefined) updateData.schoolEmail = schoolEmail;
    if (schoolAddress !== undefined) updateData.schoolAddress = schoolAddress;
    if (schoolPhone !== undefined) updateData.schoolPhone = schoolPhone;

    if (schoolAdmins !== undefined) {
      if (!Array.isArray(schoolAdmins)) {
        return {
          error: "schoolAdmins must be an array of user IDs",
          code: 400,
        };
      }
      if (schoolAdmins.length > 0) {
        const admins = await this.mongomodels.user.find({
          _id: { $in: schoolAdmins },
          role: "schoolAdmin",
        });
        if (admins.length !== schoolAdmins.length) {
          return {
            error:
              "One or more school admin IDs are invalid or not schoolAdmin role",
            code: 400,
          };
        }
      }
      updateData.schoolAdmins = schoolAdmins;
    }

    if (Object.keys(updateData).length === 0) {
      return { error: "Cant update school - no fields to update", code: 400 };
    }

    const schoolData = { ...updateData };
    delete schoolData.schoolAdmins;
    if (Object.keys(schoolData).length > 0) {
      const valResult = await this.validators.school.updateSchool(schoolData);
      if (valResult && valResult.length)
        return { errors: valResult, code: 400 };
    }

    const updatedSchool = await this.mongomodels.school.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    if (!updatedSchool) return { error: "School not found", code: 404 };

    return { school: updatedSchool };
  }

  async deleteSchool({ __longToken, id }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(["superAdmin"], __longToken.role);
    if (authCheck) return authCheck;

    if (!id) return { error: "School ID is required", code: 400 };

    const deletedSchool = await this.mongomodels.school.findByIdAndDelete(id);
    if (!deletedSchool) return { error: "School not found", code: 404 };

    return { message: "School deleted successfully", school: deletedSchool };
  }
};
