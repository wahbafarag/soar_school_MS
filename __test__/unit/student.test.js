const Student = require("../../managers/entities/students/student.manager");

const superAdminToken = { userId: "admin1", role: "superAdmin" };
const schoolAdminToken = { userId: "sa1", role: "schoolAdmin" };
const otherAdminToken = { userId: "sa2", role: "schoolAdmin" };

const makeSchool = (overrides = {}) => ({
  _id: "school1",
  schoolName: "Test School",
  schoolAdmins: [{ _id: "sa1", toString: () => "sa1" }],
  ...overrides,
});

const makeStudent = (overrides = {}) => ({
  _id: "stu1",
  studentName: "Ahmed",
  studentBirth: new Date("2010-05-15"),
  school: { _id: "school1", toString: () => "school1" },
  classrooms: ["cr1"],
  ...overrides,
});

const populateSingle = (doc) => ({
  populate: jest.fn().mockResolvedValue(doc),
});

const chainedFind = (docs) => ({
  populate: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      skip: jest.fn().mockResolvedValue(docs),
    }),
  }),
});

const buildMocks = () => {
  const validators = {
    student: {
      createStudent: jest.fn().mockResolvedValue(null),
      updateStudent: jest.fn().mockResolvedValue(null),
    },
  };
  const mongomodels = {
    school: {
      findById: jest.fn().mockResolvedValue(makeSchool()),
      find: jest.fn().mockResolvedValue([makeSchool()]),
    },
    classroom: {
      find: jest.fn().mockResolvedValue([{ _id: "cr1" }]),
    },
    student: {
      create: jest.fn().mockResolvedValue(makeStudent()),
      findById: jest.fn().mockReturnValue(populateSingle(makeStudent())),
      find: jest.fn().mockReturnValue(chainedFind([makeStudent()])),
      findByIdAndUpdate: jest.fn().mockResolvedValue(makeStudent()),
      findByIdAndDelete: jest.fn().mockResolvedValue(makeStudent()),
      countDocuments: jest.fn().mockResolvedValue(1),
    },
  };
  return {
    validators,
    mongomodels,
    managers: { token: {} },
    config: {},
    cache: {},
    cortex: {},
    utils: {},
  };
};

describe("Student Manager", () => {
  describe("createStudent", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        studentName: "A",
        studentBirth: "2010-01-01",
        school: "school1",
      });
      expect(res.code).toBe(401);
    });

    it("should return 401 for unauthorized role", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: { userId: "u1", role: "student" },
        studentName: "A",
        studentBirth: "2010-01-01",
        school: "school1",
      });
      expect(res.code).toBe(401);
    });

    it("should return validation errors", async () => {
      const deps = buildMocks();
      deps.validators.student.createStudent.mockResolvedValue([
        { message: "bad" },
      ]);
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: superAdminToken,
        studentName: "",
        studentBirth: "2010-01-01",
        school: "school1",
      });
      expect(res.errors).toBeDefined();
      expect(res.code).toBe(400);
    });

    it("should return 404 if school not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.findById.mockResolvedValue(null);
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: superAdminToken,
        studentName: "A",
        studentBirth: "2010-01-01",
        school: "bad",
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: otherAdminToken,
        studentName: "A",
        studentBirth: "2010-01-01",
        school: "school1",
      });
      expect(res.code).toBe(403);
    });

    it("should return 400 if classroom IDs invalid", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.find.mockResolvedValue([]);
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: superAdminToken,
        studentName: "A",
        studentBirth: "2010-01-01",
        school: "school1",
        classrooms: ["bad_cr"],
      });
      expect(res.code).toBe(400);
      expect(res.error).toMatch(/classroom/i);
    });

    it("should create student without classrooms", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: superAdminToken,
        studentName: "Ahmed",
        studentBirth: "2010-05-15",
        school: "school1",
      });
      expect(res.student).toBeDefined();
    });

    it("should create student with valid classrooms", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: superAdminToken,
        studentName: "Ahmed",
        studentBirth: "2010-05-15",
        school: "school1",
        classrooms: ["cr1"],
      });
      expect(res.student).toBeDefined();
    });

    it("should create student as schoolAdmin of that school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: schoolAdminToken,
        studentName: "Ahmed",
        studentBirth: "2010-05-15",
        school: "school1",
      });
      expect(res.student).toBeDefined();
    });

    it("should return 500 on db error", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.create.mockRejectedValue(new Error("boom"));
      const mgr = new Student(deps);
      const res = await mgr.createStudent({
        __longToken: superAdminToken,
        studentName: "A",
        studentBirth: "2010-01-01",
        school: "school1",
      });
      expect(res.code).toBe(500);
    });
  });

  describe("getStudent", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.getStudent({ __query: { id: "stu1" } });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.getStudent({
        __longToken: superAdminToken,
        __query: {},
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockReturnValue(populateSingle(null));
      const mgr = new Student(deps);
      const res = await mgr.getStudent({
        __longToken: superAdminToken,
        __query: { id: "nope" },
      });
      expect(res.code).toBe(404);
    });

    it("should return student for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.getStudent({
        __longToken: superAdminToken,
        __query: { id: "stu1" },
      });
      expect(res.student).toBeDefined();
    });

    it("should return 403 if schoolAdmin not admin of student's school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.getStudent({
        __longToken: otherAdminToken,
        __query: { id: "stu1" },
      });
      expect(res.code).toBe(403);
    });

    it("should allow schoolAdmin who is admin of student's school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.getStudent({
        __longToken: schoolAdminToken,
        __query: { id: "stu1" },
      });
      expect(res.student).toBeDefined();
    });
  });

  describe("listStudents", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.listStudents({ __query: {} });
      expect(res.code).toBe(401);
    });

    it("should list students for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.listStudents({
        __longToken: superAdminToken,
        __query: {},
      });
      expect(res.students).toBeDefined();
      expect(res.pagination).toBeDefined();
    });

    it("should filter by school for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.listStudents({
        __longToken: superAdminToken,
        __query: { school: "school1" },
      });
      expect(res.students).toBeDefined();
    });

    it("should return 403 if schoolAdmin not admin of filtered school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.listStudents({
        __longToken: otherAdminToken,
        __query: { school: "school1" },
      });
      expect(res.code).toBe(403);
    });

    it("should list students from schoolAdmin's own schools", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.listStudents({
        __longToken: schoolAdminToken,
        __query: {},
      });
      expect(res.students).toBeDefined();
    });

    it("should allow schoolAdmin to filter by their own school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.listStudents({
        __longToken: schoolAdminToken,
        __query: { school: "school1" },
      });
      expect(res.students).toBeDefined();
    });
  });

  describe("updateStudent", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({ id: "stu1", studentName: "B" });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        studentName: "B",
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(null);
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "nope",
        studentName: "B",
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of student's school", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: otherAdminToken,
        id: "stu1",
        studentName: "B",
      });
      expect(res.code).toBe(403);
    });

    it("should return 400 if no fields to update", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
      });
      expect(res.code).toBe(400);
    });

    it("should return 400 if classrooms is not array", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
        classrooms: "bad",
      });
      expect(res.code).toBe(400);
    });

    it("should return 400 if classroom IDs invalid", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      deps.mongomodels.classroom.find.mockResolvedValue([]);
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
        classrooms: ["bad_cr"],
      });
      expect(res.code).toBe(400);
      expect(res.error).toMatch(/classroom/i);
    });

    it("should return validation errors", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      deps.validators.student.updateStudent.mockResolvedValue([
        { message: "bad" },
      ]);
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
        studentName: "X",
      });
      expect(res.errors).toBeDefined();
      expect(res.code).toBe(400);
    });

    it("should update student name successfully", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
        studentName: "Updated",
      });
      expect(res.student).toBeDefined();
    });

    it("should update classrooms successfully", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
        classrooms: ["cr1"],
      });
      expect(res.student).toBeDefined();
    });

    it("should allow setting classrooms to empty array", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.updateStudent({
        __longToken: superAdminToken,
        id: "stu1",
        classrooms: [],
      });
      expect(res.student).toBeDefined();
    });
  });

  describe("transferStudent", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({ id: "stu1", school: "school2" });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: superAdminToken,
        school: "school2",
      });
      expect(res.code).toBe(400);
    });

    it("should return 400 if no school", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: superAdminToken,
        id: "stu1",
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if student not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(null);
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: superAdminToken,
        id: "nope",
        school: "school2",
      });
      expect(res.code).toBe(404);
    });

    it("should return 400 if same school", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: superAdminToken,
        id: "stu1",
        school: "school1",
      });
      expect(res.code).toBe(400);
      expect(res.error).toMatch(/already/i);
    });

    it("should return 403 if schoolAdmin not admin of current school", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: otherAdminToken,
        id: "stu1",
        school: "school2",
      });
      expect(res.code).toBe(403);
    });

    it("should return 404 if target school not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      deps.mongomodels.school.findById.mockResolvedValue(null);
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: superAdminToken,
        id: "stu1",
        school: "bad_school",
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of target school", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());

      deps.mongomodels.school.findById
        .mockResolvedValueOnce(makeSchool())
        .mockResolvedValueOnce(
          makeSchool({
            _id: "school2",
            schoolAdmins: [{ _id: "sa99", toString: () => "sa99" }],
          }),
        );
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: schoolAdminToken,
        id: "stu1",
        school: "school2",
      });
      expect(res.code).toBe(403);
    });

    it("should transfer student as superAdmin (empties classrooms)", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      deps.mongomodels.school.findById.mockResolvedValue(
        makeSchool({ _id: "school2" }),
      );
      const transferred = makeStudent({
        school: { _id: "school2", toString: () => "school2" },
        classrooms: [],
      });
      deps.mongomodels.student.findByIdAndUpdate.mockResolvedValue(transferred);
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: superAdminToken,
        id: "stu1",
        school: "school2",
      });
      expect(res.student).toBeDefined();
      expect(res.student.classrooms).toEqual([]);
      expect(deps.mongomodels.student.findByIdAndUpdate).toHaveBeenCalledWith(
        "stu1",
        { school: "school2", classrooms: [] },
        { new: true },
      );
    });

    it("should transfer student as schoolAdmin of both schools", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());

      deps.mongomodels.school.findById
        .mockResolvedValueOnce(makeSchool())
        .mockResolvedValueOnce(
          makeSchool({
            _id: "school2",
            schoolAdmins: [{ _id: "sa1", toString: () => "sa1" }],
          }),
        );
      const transferred = makeStudent({ classrooms: [] });
      deps.mongomodels.student.findByIdAndUpdate.mockResolvedValue(transferred);
      const mgr = new Student(deps);
      const res = await mgr.transferStudent({
        __longToken: schoolAdminToken,
        id: "stu1",
        school: "school2",
      });
      expect(res.student).toBeDefined();
      expect(res.student.classrooms).toEqual([]);
    });
  });

  describe("deleteStudent", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.deleteStudent({ id: "stu1" });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Student(deps);
      const res = await mgr.deleteStudent({
        __longToken: superAdminToken,
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(null);
      const mgr = new Student(deps);
      const res = await mgr.deleteStudent({
        __longToken: superAdminToken,
        id: "nope",
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of student's school", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.deleteStudent({
        __longToken: otherAdminToken,
        id: "stu1",
      });
      expect(res.code).toBe(403);
    });

    it("should delete student successfully", async () => {
      const deps = buildMocks();
      deps.mongomodels.student.findById.mockResolvedValue(makeStudent());
      const mgr = new Student(deps);
      const res = await mgr.deleteStudent({
        __longToken: superAdminToken,
        id: "stu1",
      });
      expect(res.message).toMatch(/deleted/i);
      expect(deps.mongomodels.student.findByIdAndDelete).toHaveBeenCalledWith(
        "stu1",
      );
    });
  });
});
