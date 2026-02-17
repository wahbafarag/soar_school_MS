const Classroom = require("../../managers/entities/classroom/classroom.manager");

const superAdminToken = { userId: "admin1", role: "superAdmin" };
const schoolAdminToken = { userId: "sa1", role: "schoolAdmin" };
const otherAdminToken = { userId: "sa2", role: "schoolAdmin" };

const makeSchool = (overrides = {}) => ({
  _id: "school1",
  schoolName: "Test School",
  schoolAdmins: [{ _id: "sa1", toString: () => "sa1" }],
  ...overrides,
});

const makeClassroom = (overrides = {}) => ({
  _id: "cr1",
  name: "Class 1-A",
  school: { _id: "school1", toString: () => "school1" },
  capacity: 30,
  ...overrides,
});

const populateResult = (doc) => ({
  populate: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      skip: jest.fn().mockResolvedValue(Array.isArray(doc) ? doc : [doc]),
    }),
  }),
});

const populateSingle = (doc) => ({
  populate: jest.fn().mockResolvedValue(doc),
});

const buildMocks = () => {
  const validators = {
    classroom: {
      createClassroom: jest.fn().mockResolvedValue(null),
      updateClassroom: jest.fn().mockResolvedValue(null),
    },
  };
  const mongomodels = {
    school: {
      findById: jest.fn().mockResolvedValue(makeSchool()),
      find: jest.fn().mockResolvedValue([makeSchool()]),
    },
    classroom: {
      create: jest.fn().mockResolvedValue(makeClassroom()),
      findById: jest.fn().mockReturnValue(populateSingle(makeClassroom())),
      find: jest.fn().mockReturnValue(populateResult([makeClassroom()])),
      findByIdAndUpdate: jest.fn().mockResolvedValue(makeClassroom()),
      findByIdAndDelete: jest.fn().mockResolvedValue(makeClassroom()),
      countDocuments: jest.fn().mockResolvedValue(1),
    },
    student: {
      updateMany: jest.fn().mockResolvedValue({}),
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

describe("Classroom Manager", () => {
  describe("createClassroom", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        name: "C",
        school: "school1",
        capacity: 30,
      });
      expect(res.code).toBe(401);
    });

    it("should return 401 for unauthorized role", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: { userId: "u1", role: "student" },
        name: "C",
        school: "school1",
        capacity: 30,
      });
      expect(res.code).toBe(401);
    });

    it("should return validation errors", async () => {
      const deps = buildMocks();
      deps.validators.classroom.createClassroom.mockResolvedValue([
        { message: "bad" },
      ]);
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: superAdminToken,
        name: "",
        school: "school1",
        capacity: 30,
      });
      expect(res.errors).toBeDefined();
      expect(res.code).toBe(400);
    });

    it("should return 404 if school not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.findById.mockResolvedValue(null);
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: superAdminToken,
        name: "C",
        school: "bad",
        capacity: 30,
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of school", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: otherAdminToken,
        name: "C",
        school: "school1",
        capacity: 30,
      });
      expect(res.code).toBe(403);
    });

    it("should create classroom as superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: superAdminToken,
        name: "Class 1-A",
        school: "school1",
        capacity: 30,
      });
      expect(res.classroom).toBeDefined();
    });

    it("should create classroom as schoolAdmin of that school", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: schoolAdminToken,
        name: "Class 1-A",
        school: "school1",
        capacity: 30,
      });
      expect(res.classroom).toBeDefined();
    });

    it("should return 500 on db error", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.create.mockRejectedValue(new Error("boom"));
      const mgr = new Classroom(deps);
      const res = await mgr.createClassroom({
        __longToken: superAdminToken,
        name: "C",
        school: "school1",
        capacity: 30,
      });
      expect(res.code).toBe(500);
    });
  });

  describe("getClassroom", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.getClassroom({ __query: { id: "cr1" } });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.getClassroom({
        __longToken: superAdminToken,
        __query: {},
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockReturnValue(populateSingle(null));
      const mgr = new Classroom(deps);
      const res = await mgr.getClassroom({
        __longToken: superAdminToken,
        __query: { id: "nope" },
      });
      expect(res.code).toBe(404);
    });

    it("should return classroom for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.getClassroom({
        __longToken: superAdminToken,
        __query: { id: "cr1" },
      });
      expect(res.classroom).toBeDefined();
    });

    it("should return 403 if schoolAdmin not admin of school", async () => {
      const deps = buildMocks();

      const mgr = new Classroom(deps);
      const res = await mgr.getClassroom({
        __longToken: otherAdminToken,
        __query: { id: "cr1" },
      });
      expect(res.code).toBe(403);
    });

    it("should allow schoolAdmin who is admin of school", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.getClassroom({
        __longToken: schoolAdminToken,
        __query: { id: "cr1" },
      });
      expect(res.classroom).toBeDefined();
    });
  });

  describe("listClassrooms", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.listClassrooms({ __query: {} });
      expect(res.code).toBe(401);
    });

    it("should list classrooms for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.listClassrooms({
        __longToken: superAdminToken,
        __query: {},
      });
      expect(res.classrooms).toBeDefined();
      expect(res.pagination).toBeDefined();
    });

    it("should filter by school for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.listClassrooms({
        __longToken: superAdminToken,
        __query: { school: "school1" },
      });
      expect(res.classrooms).toBeDefined();
    });

    it("should return 403 if schoolAdmin not admin of filtered school", async () => {
      const deps = buildMocks();

      const mgr = new Classroom(deps);
      const res = await mgr.listClassrooms({
        __longToken: otherAdminToken,
        __query: { school: "school1" },
      });
      expect(res.code).toBe(403);
    });

    it("should list all classrooms for schoolAdmin's schools", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.listClassrooms({
        __longToken: schoolAdminToken,
        __query: {},
      });
      expect(res.classrooms).toBeDefined();
    });
  });

  describe("updateClassroom", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({ id: "cr1", name: "New" });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({
        __longToken: superAdminToken,
        name: "New",
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(null);
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({
        __longToken: superAdminToken,
        id: "nope",
        name: "New",
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of school", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(makeClassroom());
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({
        __longToken: otherAdminToken,
        id: "cr1",
        name: "New",
      });
      expect(res.code).toBe(403);
    });

    it("should return 400 if no fields to update", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(makeClassroom());
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({
        __longToken: superAdminToken,
        id: "cr1",
      });
      expect(res.code).toBe(400);
    });

    it("should return validation errors", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(makeClassroom());
      deps.validators.classroom.updateClassroom.mockResolvedValue([
        { message: "bad" },
      ]);
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({
        __longToken: superAdminToken,
        id: "cr1",
        name: "X",
      });
      expect(res.errors).toBeDefined();
      expect(res.code).toBe(400);
    });

    it("should update classroom successfully", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(makeClassroom());
      const mgr = new Classroom(deps);
      const res = await mgr.updateClassroom({
        __longToken: superAdminToken,
        id: "cr1",
        name: "Updated",
        capacity: 40,
      });
      expect(res.classroom).toBeDefined();
    });
  });

  describe("deleteClassroom", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.deleteClassroom({ id: "cr1" });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new Classroom(deps);
      const res = await mgr.deleteClassroom({
        __longToken: superAdminToken,
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(null);
      const mgr = new Classroom(deps);
      const res = await mgr.deleteClassroom({
        __longToken: superAdminToken,
        id: "nope",
      });
      expect(res.code).toBe(404);
    });

    it("should return 403 if schoolAdmin not admin of school", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(makeClassroom());
      const mgr = new Classroom(deps);
      const res = await mgr.deleteClassroom({
        __longToken: otherAdminToken,
        id: "cr1",
      });
      expect(res.code).toBe(403);
    });

    it("should delete classroom and pull from students", async () => {
      const deps = buildMocks();
      deps.mongomodels.classroom.findById.mockResolvedValue(makeClassroom());
      const mgr = new Classroom(deps);
      const res = await mgr.deleteClassroom({
        __longToken: superAdminToken,
        id: "cr1",
      });
      expect(res.message).toMatch(/deleted/i);
      expect(deps.mongomodels.student.updateMany).toHaveBeenCalledWith(
        { classrooms: "cr1" },
        { $pull: { classrooms: "cr1" } },
      );
      expect(deps.mongomodels.classroom.findByIdAndDelete).toHaveBeenCalledWith(
        "cr1",
      );
    });
  });
});
