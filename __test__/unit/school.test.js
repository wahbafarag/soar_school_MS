const School = require("../../managers/entities/school/School.manager");

const superAdminToken = { userId: "admin1", role: "superAdmin" };
const schoolAdminToken = { userId: "sa1", role: "schoolAdmin" };

const makeSchool = (overrides = {}) => ({
  _id: "school1",
  schoolName: "Test School",
  schoolEmail: "test@school.com",
  schoolAddress: "123 Street",
  schoolPhone: "+201234567890",
  schoolAdmins: [{ _id: "sa1", toString: () => "sa1" }],
  ...overrides,
});

const populateResult = (doc) => ({
  populate: jest.fn().mockResolvedValue(doc),
});

const buildMocks = (overrides = {}) => {
  const validators = {
    school: {
      createSchool: jest.fn().mockResolvedValue(null),
      updateSchool: jest.fn().mockResolvedValue(null),
    },
  };
  const mongomodels = {
    user: { find: jest.fn().mockResolvedValue([]) },
    school: {
      create: jest.fn().mockResolvedValue(makeSchool()),
      findById: jest.fn().mockReturnValue(populateResult(makeSchool())),
      find: jest.fn().mockReturnValue(populateResult([makeSchool()])),
      findByIdAndUpdate: jest.fn().mockResolvedValue(makeSchool()),
      findByIdAndDelete: jest.fn().mockResolvedValue(makeSchool()),
    },
  };
  return {
    validators: overrides.validators || validators,
    mongomodels: overrides.mongomodels || mongomodels,
    managers: { token: {} },
    config: {},
    cache: {},
    cortex: {},
    utils: {},
  };
};

describe("School Manager", () => {
  describe("createSchool", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.createSchool({ schoolName: "S" });
      expect(res).toEqual({ error: "unauthorized", code: 401 });
    });

    it("should return 401 if role is not superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: schoolAdminToken,
        schoolName: "S",
      });
      expect(res.error).toBeDefined();
      expect(res.code).toBe(401);
    });

    it("should return validation errors", async () => {
      const deps = buildMocks();
      deps.validators.school.createSchool.mockResolvedValue([
        { message: "bad" },
      ]);
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: superAdminToken,
        schoolName: "S",
      });
      expect(res.errors).toBeDefined();
      expect(res.code).toBe(400);
    });

    it("should return 400 if schoolAdmins IDs are invalid", async () => {
      const deps = buildMocks();
      deps.mongomodels.user.find.mockResolvedValue([]);
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: superAdminToken,
        schoolName: "S",
        schoolEmail: "e@e.com",
        schoolAddress: "addr",
        schoolPhone: "123",
        schoolAdmins: ["nonexistent"],
      });
      expect(res.error).toMatch(/invalid/i);
      expect(res.code).toBe(400);
    });

    it("should create school successfully", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: superAdminToken,
        schoolName: "Test School",
        schoolEmail: "test@school.com",
        schoolAddress: "123 Street",
        schoolPhone: "+201234567890",
      });
      expect(res.school).toBeDefined();
      expect(deps.mongomodels.school.create).toHaveBeenCalled();
    });

    it("should create school with valid admins", async () => {
      const deps = buildMocks();
      deps.mongomodels.user.find.mockResolvedValue([
        { _id: "sa1", role: "schoolAdmin" },
      ]);
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: superAdminToken,
        schoolName: "Test School",
        schoolEmail: "test@school.com",
        schoolAddress: "123 Street",
        schoolPhone: "+201234567890",
        schoolAdmins: ["sa1"],
      });
      expect(res.school).toBeDefined();
    });

    it("should return 409 on duplicate", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.create.mockRejectedValue({ code: 11000 });
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: superAdminToken,
        schoolName: "S",
        schoolEmail: "e@e.com",
        schoolAddress: "a",
        schoolPhone: "1",
      });
      expect(res.code).toBe(409);
    });

    it("should return 500 on unknown error", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.create.mockRejectedValue(new Error("boom"));
      const mgr = new School(deps);
      const res = await mgr.createSchool({
        __longToken: superAdminToken,
        schoolName: "S",
        schoolEmail: "e@e.com",
        schoolAddress: "a",
        schoolPhone: "1",
      });
      expect(res.code).toBe(500);
    });
  });

  describe("getSchool", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.getSchool({ __query: { id: "school1" } });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.getSchool({
        __longToken: superAdminToken,
        __query: {},
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.findById.mockReturnValue(populateResult(null));
      const mgr = new School(deps);
      const res = await mgr.getSchool({
        __longToken: superAdminToken,
        __query: { id: "nope" },
      });
      expect(res.code).toBe(404);
    });

    it("should return school for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.getSchool({
        __longToken: superAdminToken,
        __query: { id: "school1" },
      });
      expect(res.school).toBeDefined();
    });

    it("should return 403 if schoolAdmin not assigned", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.findById.mockReturnValue(
        populateResult(
          makeSchool({
            schoolAdmins: [{ _id: "other", toString: () => "other" }],
          }),
        ),
      );
      const mgr = new School(deps);
      const res = await mgr.getSchool({
        __longToken: schoolAdminToken,
        __query: { id: "school1" },
      });
      expect(res.code).toBe(403);
    });

    it("should allow schoolAdmin who is assigned", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.getSchool({
        __longToken: schoolAdminToken,
        __query: { id: "school1" },
      });
      expect(res.school).toBeDefined();
    });
  });

  describe("listSchools", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.listSchools({ __query: {} });
      expect(res.code).toBe(401);
    });

    it("should list all schools for superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.listSchools({
        __longToken: superAdminToken,
        __query: {},
      });
      expect(res.schools).toBeDefined();
    });

    it("should filter by admin for schoolAdmin", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.listSchools({
        __longToken: schoolAdminToken,
        __query: {},
      });
      expect(res.schools).toBeDefined();
      expect(deps.mongomodels.school.find).toHaveBeenCalledWith(
        expect.objectContaining({ schoolAdmins: "sa1" }),
      );
    });
  });

  describe("updateSchool", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.updateSchool({ id: "school1" });
      expect(res.code).toBe(401);
    });

    it("should return 401 if not superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: schoolAdminToken,
        id: "school1",
        schoolName: "New",
      });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
      });
      expect(res.code).toBe(400);
    });

    it("should return 400 if no fields to update", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "school1",
      });
      expect(res.code).toBe(400);
    });

    it("should return 400 if schoolAdmins is not array", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "school1",
        schoolAdmins: "bad",
      });
      expect(res.code).toBe(400);
    });

    it("should return 400 if admin IDs invalid", async () => {
      const deps = buildMocks();
      deps.mongomodels.user.find.mockResolvedValue([]);
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "school1",
        schoolAdmins: ["bad"],
      });
      expect(res.code).toBe(400);
    });

    it("should return validation errors for school fields", async () => {
      const deps = buildMocks();
      deps.validators.school.updateSchool.mockResolvedValue([
        { message: "bad" },
      ]);
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "school1",
        schoolName: "X",
      });
      expect(res.errors).toBeDefined();
      expect(res.code).toBe(400);
    });

    it("should return 404 if school not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.findByIdAndUpdate.mockResolvedValue(null);
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "nope",
        schoolName: "New",
      });
      expect(res.code).toBe(404);
    });

    it("should update school successfully", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "school1",
        schoolName: "Updated",
      });
      expect(res.school).toBeDefined();
    });

    it("should update only schoolAdmins without validating school fields", async () => {
      const deps = buildMocks();
      deps.mongomodels.user.find.mockResolvedValue([
        { _id: "sa1", role: "schoolAdmin" },
      ]);
      const mgr = new School(deps);
      const res = await mgr.updateSchool({
        __longToken: superAdminToken,
        id: "school1",
        schoolAdmins: ["sa1"],
      });
      expect(res.school).toBeDefined();
      expect(deps.validators.school.updateSchool).not.toHaveBeenCalled();
    });
  });

  describe("deleteSchool", () => {
    it("should return 401 if no token", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.deleteSchool({ id: "school1" });
      expect(res.code).toBe(401);
    });

    it("should return 401 if not superAdmin", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.deleteSchool({
        __longToken: schoolAdminToken,
        id: "school1",
      });
      expect(res.code).toBe(401);
    });

    it("should return 400 if no id", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.deleteSchool({
        __longToken: superAdminToken,
      });
      expect(res.code).toBe(400);
    });

    it("should return 404 if not found", async () => {
      const deps = buildMocks();
      deps.mongomodels.school.findByIdAndDelete.mockResolvedValue(null);
      const mgr = new School(deps);
      const res = await mgr.deleteSchool({
        __longToken: superAdminToken,
        id: "nope",
      });
      expect(res.code).toBe(404);
    });

    it("should delete school successfully", async () => {
      const deps = buildMocks();
      const mgr = new School(deps);
      const res = await mgr.deleteSchool({
        __longToken: superAdminToken,
        id: "school1",
      });
      expect(res.message).toMatch(/deleted/i);
      expect(res.school).toBeDefined();
    });
  });
});
