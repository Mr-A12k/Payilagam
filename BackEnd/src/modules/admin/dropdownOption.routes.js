const express = require("express");
const router = express.Router();

const {
  getAllFieldGroups,
  getOptionsByFieldGroup,
  createOption,
  updateOption,
  deleteOption,
  reorderOptions,
} = require("./dropdownOption.controller");

const { authenticate, authorize } = require("../../middlewares/authMiddleware");

// Admin Router (mounted at /api/admin/dropdown-options)
const adminRouter = express.Router();
adminRouter.use(authenticate, authorize("admin"));

adminRouter.get("/", getAllFieldGroups);
adminRouter.get("/:fieldGroup", getOptionsByFieldGroup);
adminRouter.post("/", createOption);
adminRouter.put("/:id", updateOption);
adminRouter.delete("/:id", deleteOption);
adminRouter.put("/:fieldGroup/reorder", reorderOptions);

// Public Router (mounted at /api/dropdown-options)
const publicRouter = express.Router();
// For public endpoint, we only want active options, which is the default in the controller if includeInactive is not true
publicRouter.get("/:fieldGroup", getOptionsByFieldGroup);

module.exports = {
  adminRouter,
  publicRouter,
};
