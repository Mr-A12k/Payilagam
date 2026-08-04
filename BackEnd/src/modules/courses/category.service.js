const prisma = require('../../config/prisma');

/**
 * Generate a URL-friendly slug from a category name
 */
const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

/**
 * Create a new category
 */
const createCategory = async (data) => {
    const { name, description, icon, parentId } = data;

    // Check for duplicate name
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
        throw new Error('Category with this name already exists');
    }

    const slug = generateSlug(name);

    // Check for duplicate slug
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
        throw new Error('Category with this slug already exists');
    }

    // Validate parentId if provided
    if (parentId) {
        const parentCategory = await prisma.category.findUnique({
            where: { categoryId: parentId },
        });
        if (!parentCategory) {
            throw new Error('Parent category not found');
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
        orderBy: { name: 'asc' },
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
        throw new Error('Category not found');
    }

    return category;
};

/**
 * Update a category by ID
 */
const updateCategory = async (id, data) => {
    const existing = await prisma.category.findUnique({
        where: { categoryId: id },
    });

    if (!existing) {
        throw new Error('Category not found');
    }

    const updateData = {};

    if (data.name !== undefined) {
        // Check for duplicate name
        const duplicate = await prisma.category.findUnique({ where: { name: data.name } });
        if (duplicate && duplicate.categoryId !== id) {
            throw new Error('Category with this name already exists');
        }
        updateData.name = data.name;
        updateData.slug = generateSlug(data.name);

        // Check for duplicate slug
        const slugDuplicate = await prisma.category.findUnique({ where: { slug: updateData.slug } });
        if (slugDuplicate && slugDuplicate.categoryId !== id) {
            throw new Error('Category with this slug already exists');
        }
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;

    if (data.parentId !== undefined) {
        if (data.parentId === id) {
            throw new Error('Category cannot be its own parent');
        }
        if (data.parentId) {
            const parentCategory = await prisma.category.findUnique({
                where: { categoryId: data.parentId },
            });
            if (!parentCategory) {
                throw new Error('Parent category not found');
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
        throw new Error('Category not found');
    }

    if (existing.children.length > 0) {
        throw new Error('Cannot delete category with subcategories. Delete or reassign children first.');
    }

    if (existing._count.courses > 0) {
        throw new Error('Cannot delete category with associated courses. Reassign courses first.');
    }

    await prisma.category.delete({
        where: { categoryId: id },
    });

    return { message: 'Category deleted successfully' };
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
