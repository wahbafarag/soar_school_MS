const { allowedTo } = require("../../../helpers/allowedTo");

module.exports = class Student {
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
      "createStudent",
      "get=getStudent",
      "get=listStudents",
      "put=updateStudent",
      "put=transferStudent",
      "delete=deleteStudent",
    ];
  }

  async createStudent({
    __longToken,
    studentName,
    studentBirth,
    school,
    studentPic,
    classrooms,
  }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };

    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    const studentData = { studentName, studentBirth, school };
    if (studentPic) studentData.studentPic = studentPic;
    if (classrooms) studentData.classrooms = classrooms;

    // Input Validation
    const result = await this.validators.student.createStudent(studentData);
    if (result && result.length) return { errors: result, code: 400 };

    // Valid School
    const schoolDoc = await this.mongomodels.school.findById(school);
    if (!schoolDoc) return { error: "School Info is not valid", code: 404 };

    // Admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = schoolDoc.schoolAdmins.some(
        (adminId) => adminId.toString() === __longToken.userId,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to create students in this school",
          code: 403,
        };
    }

    let validClassroomIds = [];
    if (classrooms && Array.isArray(classrooms) && classrooms.length > 0) {
      const classroomDocs = await this.mongomodels.classroom.find({
        _id: { $in: classrooms },
        school,
      });
      if (classroomDocs.length !== classrooms.length) {
        return {
          error:
            "One or more classroom IDs are invalid or do not belong to this school",
          code: 400,
        };
      }
      validClassroomIds = classrooms;
    }

    try {
      const createdStudent = await this.mongomodels.student.create({
        studentName,
        studentBirth: new Date(studentBirth),
        school,
        studentPic: studentPic || undefined,
        classrooms: validClassroomIds,
      });

      return { student: createdStudent };
    } catch (err) {
      console.log(err);
      return { error: "Student Creation Failed", code: 500 };
    }
  }

  async getStudent({ __longToken, __query }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    const id = __query?.id;
    if (!id) return { error: "Student ID is required", code: 400 };

    const student = await this.mongomodels.student
      .findById(id)
      .populate("school", "schoolName schoolEmail");
    if (!student) return { error: "This Student does not exist", code: 404 };

    // Admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = await this._isAdminOfSchool(
        __longToken.userId,
        student.school._id || student.school,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to view this student",
          code: 403,
        };
    }

    return { student };
  }

  async listStudents({ __longToken, __query }) {
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
            error: "You are not authorized to list students in this school",
            code: 403,
          };
        filter.school = schoolId;
      } else {
        // Find all schools this admin belongs to
        const adminSchools = await this.mongomodels.school.find({
          schoolAdmins: __longToken.userId,
        });
        const schoolIds = adminSchools.map((s) => s._id);
        filter.school = { $in: schoolIds };
      }
    } else if (schoolId) {
      filter.school = schoolId;
    }

    const students = await this.mongomodels.student
      .find(filter)
      .populate("school", "schoolName")
      .limit(limit ? parseInt(limit) : 10)
      .skip(skip ? parseInt(skip) : 0);

    return {
      students,
      pagination: {
        total: await this.mongomodels.student.countDocuments(filter),
        page,
        limit,
      },
    };
  }

  async updateStudent({
    __longToken,
    id,
    studentName,
    studentBirth,
    studentPic,
    classrooms,
  }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    if (!id) return { error: "Student ID is required", code: 400 };

    const existingStudent = await this.mongomodels.student.findById(id);
    if (!existingStudent)
      return { error: "This Student does not exist", code: 404 };

    // Admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = await this._isAdminOfSchool(
        __longToken.userId,
        existingStudent.school,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to update this student",
          code: 403,
        };
    }

    const updateData = {};
    if (studentName !== undefined) updateData.studentName = studentName;
    if (studentBirth !== undefined)
      updateData.studentBirth = new Date(studentBirth);
    if (studentPic !== undefined) updateData.studentPic = studentPic;

    if (classrooms !== undefined) {
      if (!Array.isArray(classrooms)) {
        return {
          error: "Invalid Classroom Format",
          code: 400,
        };
      }
      if (classrooms.length > 0) {
        const classroomDocs = await this.mongomodels.classroom.find({
          _id: { $in: classrooms },
          school: existingStudent.school,
        });
        if (classroomDocs.length !== classrooms.length) {
          return {
            error:
              "One or more classroom IDs are invalid or do not belong to this school",
            code: 400,
          };
        }
      }
      updateData.classrooms = classrooms;
    }

    if (Object.keys(updateData).length === 0) {
      return { error: "Cant update student - no fields to update", code: 400 };
    }

    const inputData = {};
    if (updateData.studentName) inputData.studentName = updateData.studentName;
    if (studentBirth !== undefined) inputData.studentBirth = studentBirth;
    if (updateData.studentPic) inputData.studentPic = updateData.studentPic;

    if (Object.keys(inputData).length) {
      const validationResult =
        await this.validators.student.updateStudent(inputData);
      if (validationResult && validationResult.length)
        return { errors: validationResult, code: 400 };
    }

    const updatedStudent = await this.mongomodels.student.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return { student: updatedStudent };
  }

  async transferStudent({ __longToken, id, school }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    if (!id) return { error: "Student ID is required", code: 400 };
    if (!school) return { error: "Target school ID is required", code: 400 };

    const existingStudent = await this.mongomodels.student.findById(id);
    if (!existingStudent)
      return { error: "This Student does not exist", code: 404 };

    if (school === existingStudent.school.toString()) {
      return { error: "Student already belongs to this school", code: 400 };
    }

    if (__longToken.role === "schoolAdmin") {
      const isAdminOfCurrent = await this._isAdminOfSchool(
        __longToken.userId,
        existingStudent.school,
      );
      if (!isAdminOfCurrent)
        return {
          error: "You are not authorized to transfer this student",
          code: 403,
        };
    }

    const newSchool = await this.mongomodels.school.findById(school);
    if (!newSchool)
      return { error: "The target school does not exist", code: 404 };

    if (__longToken.role === "schoolAdmin") {
      const isAdminOfNew = newSchool.schoolAdmins.some(
        (adminId) => adminId.toString() === __longToken.userId,
      );
      if (!isAdminOfNew)
        return {
          error: "You are not authorized to transfer to this school",
          code: 403,
        };
    }

    const updatedStudent = await this.mongomodels.student.findByIdAndUpdate(
      id,
      { school, classrooms: [] },
      { new: true },
    );

    return { student: updatedStudent };
  }

  async deleteStudent({ __longToken, id }) {
    if (!__longToken) return { error: "Unauthorized", code: 401 };
    const authCheck = allowedTo(
      ["superAdmin", "schoolAdmin"],
      __longToken.role,
    );
    if (authCheck) return authCheck;

    if (!id) return { error: "Student ID is required", code: 400 };

    const student = await this.mongomodels.student.findById(id);
    if (!student) return { error: "This Student does not exist", code: 404 };

    // Admin of the school
    if (__longToken.role === "schoolAdmin") {
      const isAdmin = await this._isAdminOfSchool(
        __longToken.userId,
        student.school,
      );
      if (!isAdmin)
        return {
          error: "You are not authorized to delete this student",
          code: 403,
        };
    }

    await this.mongomodels.student.findByIdAndDelete(id);

    return { message: "Student deleted successfully" };
  }

  // ------------------------ Helper Functions ------------------------
  async _isAdminOfSchool(userId, schoolId) {
    const school = await this.mongomodels.school.findById(schoolId);
    if (!school) return false;
    return school.schoolAdmins.some((adminId) => adminId.toString() === userId);
  }
};
