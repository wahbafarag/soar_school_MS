const { allowedTo } = require("../../../helpers/allowedTo");

module.exports = class Classroom {
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
      "createClassroom",
      "get=getClassroom",
      "get=listClassrooms",
      "put=updateClassroom",
      "delete=deleteClassroom",
    ];
  }

  async createClassroom({ __longToken, name, school, capacity }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    // Input Validation
    const result = await this.validators.classroom.createClassroom({
      name,
      school,
      capacity,
    });
    if (result && result.length) return { errors: result, code: 400 };

    // Valid School
    const schoolDoc = await this.mongomodels.school.findById(school);
    if (!schoolDoc) return { error: "School not found", code: 404 };

    // admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = schoolDoc.schoolAdmins.some(
        (adminId) => adminId.toString() === __longToken.userId,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to create classrooms in this school",
          code: 403,
        };
    }

    try {
      const createdClassroom = await this.mongomodels.classroom.create({
        name,
        school,
        capacity,
      });
      return { classroom: createdClassroom };
    } catch (err) {
      console.log(err);
      return { error: "Classroom Creation Failed", code: 500 };
    }
  }

  async getClassroom({ __longToken, __query }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    const id = __query?.id;
    if (!id) return { error: "Classroom ID is required", code: 400 };

    const classroom = await this.mongomodels.classroom
      .findById(id)
      .populate("school", "schoolName schoolEmail");
    if (!classroom) return { error: "Classroom not found", code: 404 };

    // admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = await this._isAdminOfSchool(
        __longToken.userId,
        classroom.school._id || classroom.school,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to view this classroom",
          code: 403,
        };
    }

    return { classroom };
  }

  async listClassrooms({ __longToken, __query }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    let filter = {};
    const schoolId = __query?.school;

    let { limit = "15", page = "1" } = __query;
    limit = Number(limit);
    page = Number(page);
    const skip = (page - 1) * limit;

    if (__longToken.role === "schoolAdmin") {
      if (schoolId) {
        const isAdmin = await this._isAdminOfSchool(
          __longToken.userId,
          schoolId,
        );
        if (!isAdmin)
          return {
            error: "You are not authorized to list classrooms in this school",
            code: 403,
          };
        filter.school = schoolId;
      } else {
        const adminSchools = await this.mongomodels.school.find({
          schoolAdmins: __longToken.userId,
        });
        const schoolIds = adminSchools.map((s) => s._id);
        filter.school = { $in: schoolIds };
      }
    } else if (schoolId) {
      filter.school = schoolId;
    }

    const classrooms = await this.mongomodels.classroom
      .find(filter)
      .populate("school", "schoolName")
      .limit(limit)
      .skip(skip);

    return {
      classrooms,
      pagination: {
        total: await this.mongomodels.classroom.countDocuments(filter),
        page,
        limit,
      },
    };
  }

  async updateClassroom({ __longToken, id, name, capacity }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    if (!id) return { error: "Classroom ID is required", code: 400 };

    const existingClassroom = await this.mongomodels.classroom.findById(id);
    if (!existingClassroom) return { error: "Classroom not found", code: 404 };

    // admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = await this._isAdminOfSchool(
        __longToken.userId,
        existingClassroom.school,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to update this classroom",
          code: 403,
        };
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = capacity;

    if (Object.keys(updateData).length === 0) {
      return {
        error: "Cant update classroom - no fields to update",
        code: 400,
      };
    }

    const valResult =
      await this.validators.classroom.updateClassroom(updateData);
    if (valResult && valResult.length) return { errors: valResult, code: 400 };

    const updatedClassroom = await this.mongomodels.classroom.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    );

    return { classroom: updatedClassroom };
  }

  async deleteClassroom({ __longToken, id }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    if (!id) return { error: "Classroom ID is required", code: 400 };

    const classroom = await this.mongomodels.classroom.findById(id);
    if (!classroom) return { error: "Classroom not found", code: 404 };

    // admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = await this._isAdminOfSchool(
        __longToken.userId,
        classroom.school,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to delete this classroom",
          code: 403,
        };
    }

    await this.mongomodels.student.updateMany(
      { classrooms: id },
      { $pull: { classrooms: id } },
    );

    await this.mongomodels.classroom.findByIdAndDelete(id);

    return { message: "Classroom deleted successfully" };
  }

  // ------------------------ Helper Functions ------------------------
  async _isAdminOfSchool(userId, schoolId) {
    const school = await this.mongomodels.school.findById(schoolId);
    if (!school) return false;
    return school.schoolAdmins.some((adminId) => adminId.toString() === userId);
  }
};
