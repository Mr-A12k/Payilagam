const catchAsync = require("../../utils/catchAsync");
const categoryService = require("./category.service");
const { success, error } = require("../../utils/responseHelper");

const create = catchAsync(async (request, response) => {
  const category = await categoryService.createCategory(request.body);
  return success(response, category, "Category created successfully", 201);
});

const getAll = catchAsync(async (request, response) => {
  const categories = await categoryService.getAllCategories();
  return success(response, categories, "Categories retrieved successfully");
});

const getById = catchAsync(async (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id)) {
    return error(response, "Invalid category ID", 400);
  }
  const category = await categoryService.getCategoryById(id);
  return success(response, category, "Category retrieved successfully");
});

const update = catchAsync(async (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id)) {
    return error(response, "Invalid category ID", 400);
  }
  const category = await categoryService.updateCategory(id, request.body);
  return success(response, category, "Category updated successfully");
});

const remove = catchAsync(async (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id)) {
    return error(response, "Invalid category ID", 400);
  }
  const result = await categoryService.deleteCategory(id);
  return success(response, result, "Category deleted successfully");
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
