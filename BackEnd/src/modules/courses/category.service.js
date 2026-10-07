const prisma = require("../../config/prisma");
const categoryError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validateCategory = data => {
  if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) throw categoryError('Category name is required');
  if (data.name !== undefined) data.name = data.name.trim();
  if (data.parentId !== undefined && data.parentId !== null && (!Number.isInteger(data.parentId) || data.parentId < 1)) throw categoryError('Invalid parent category');
};

/**
 * Generate a URL-friendly slug from a category name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Create a new category
 */
const createCategory = async (data) => {
  validateCategory(data);
  if (!data.name) throw categoryError('Category name is required');
  const { name, description, icon, parentId } = data;

  // Check for duplicate name
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    throw categoryError("Category with this name already exists", 409);
  }

  const slug = generateSlug(name);

  // Check for duplicate slug
  const existingSlug = await prisma.category.findUnique({ where: { slug } });
  if (existingSlug) {
    throw categoryError("Category with this slug already exists", 409);
  }

  // Validate parentId if provided
  if (parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { categoryId: parentId },
    });
    if (!parentCategory) {
      throw categoryError("Parent category not found", 404);
    }
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      icon: icon || null,
      parentId: parentId || null,
    },
    include: {
      parent: true,
      children: true,
    },
  });

  return category;
};

/**
 * Get all categories in a nested tree structure
 */
const getAllCategories = async () => {
  // Fetch top-level categories (no parent) with nested children
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: true, // 3 levels deep
            },
          },
        },
      },
      _count: {
        select: { courses: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
};

/**
 * Get a single category by ID with course count
 */
const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { categoryId: id },
    include: {
      parent: true,
      children: {
        include: {
          _count: {
            select: { courses: true },
          },
        },
      },
      _count: {
        select: { courses: true },
      },
    },
  });

  if (!category) {
    throw categoryError("Category not found", 404);
  }

  return category;
};

/**
 * Update a category by ID
 */
const updateCategory = async (id, data) => {
  validateCategory(data);
  const existing = await prisma.category.findUnique({
    where: { categoryId: id },
  });

  if (!existing) {
    throw categoryError("Category not found", 404);
  }

  const updateData = {};

  if (data.name !== undefined) {
    // Check for duplicate name
    const duplicate = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (duplicate && duplicate.categoryId !== id) {
      throw categoryError("Category with this name already exists", 409);
    }
    updateData.name = data.name;
    updateData.slug = generateSlug(data.name);

    // Check for duplicate slug
    const slugDuplicate = await prisma.category.findUnique({
      where: { slug: updateData.slug },
    });
    if (slugDuplicate && slugDuplicate.categoryId !== id) {
      throw categoryError("Category with this slug already exists", 409);
    }
  }

  if (data.description !== undefined) updateData.description = data.description;
  if (data.icon !== undefined) updateData.icon = data.icon;

  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      throw categoryError("Category cannot be its own parent");
    }
    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { categoryId: data.parentId },
      });
      if (!parentCategory) {
        throw categoryError("Parent category not found", 404);
      }
      let ancestor = parentCategory;
      const visited = new Set();
      while (ancestor) {
        if (ancestor.categoryId === id || visited.has(ancestor.categoryId)) throw categoryError('Category hierarchy cannot contain a cycle');
        visited.add(ancestor.categoryId);
        ancestor = ancestor.parentId ? await prisma.category.findUnique({ where: { categoryId: ancestor.parentId } }) : null;
      }
    }
    updateData.parentId = data.parentId;
  }

  const category = await prisma.category.update({
    where: { categoryId: id },
    data: updateData,
    include: {
      parent: true,
      children: true,
    },
  });

  return category;
};

/**
 * Delete a category by ID
 */
const deleteCategory = async (id) => {
  const existing = await prisma.category.findUnique({
    where: { categoryId: id },
    include: {
      children: true,
      _count: { select: { courses: true } },
    },
  });

  if (!existing) {
    throw categoryError("Category not found", 404);
  }

  if (existing.children.length > 0) {
    throw categoryError(
      "Cannot delete category with subcategories. Delete or reassign children first.",
    );
  }

  if (existing._count.courses > 0) {
    throw categoryError(
      "Cannot delete category with associated courses. Reassign courses first.",
    );
  }

  await prisma.category.delete({
    where: { categoryId: id },
  });

  return { message: "Category deleted successfully" };
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
