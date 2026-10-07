const catchAsync = require("../../utils/catchAsync");
const dropdownOptionService = require("./dropdownOption.service");
const { success } = require("../../utils/responseHelper");

const getAllFieldGroups = catchAsync(async (req, res) => {
  const groups = await dropdownOptionService.getAllFieldGroups();
  return success(res, groups, "Dropdown field groups retrieved");
});

const getOptionsByFieldGroup = catchAsync(async (req, res) => {
  // Check query param for includeInactive
  const includeInactive = req.query.includeInactive === "true";
  const options = await dropdownOptionService.getOptionsByFieldGroup(
    req.params.fieldGroup,
    includeInactive
  );
  return success(res, options, `Options for ${req.params.fieldGroup} retrieved`);
});

const createOption = catchAsync(async (req, res) => {
  const option = await dropdownOptionService.createOption(req.body);
  return success(res, option, "Dropdown option created", 201);
});

const updateOption = catchAsync(async (req, res) => {
  const option = await dropdownOptionService.updateOption(req.params.id, req.body);
  return success(res, option, "Dropdown option updated");
});

const deleteOption = catchAsync(async (req, res) => {
  const result = await dropdownOptionService.deleteOption(req.params.id);
  return success(res, result, "Dropdown option deleted");
});

const reorderOptions = catchAsync(async (req, res) => {
  const { orderedIds } = req.body;
  const options = await dropdownOptionService.reorderOptions(req.params.fieldGroup, orderedIds);
  return success(res, options, "Dropdown options reordered");
});

module.exports = {
  getAllFieldGroups,
  getOptionsByFieldGroup,
  createOption,
  updateOption,
  deleteOption,
  reorderOptions,
};
