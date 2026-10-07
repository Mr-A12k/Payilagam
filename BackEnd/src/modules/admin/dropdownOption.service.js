const prisma = require("../../config/prisma");

const optionError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const getOptionsByFieldGroup = async (fieldGroup, includeInactive = false) => {
  const where = { fieldGroup };
  if (!includeInactive) {
    where.isActive = true;
  }
  return prisma.dropdownOption.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });
};

const getAllFieldGroups = async () => {
  const groups = await prisma.dropdownOption.groupBy({
    by: ["fieldGroup"],
    _count: {
      _all: true,
    },
    orderBy: { fieldGroup: "asc" },
  });

  // Get all options to structure the response nicely
  const allOptions = await prisma.dropdownOption.findMany({
    orderBy: [{ fieldGroup: "asc" }, { sortOrder: "asc" }],
  });

  const structuredGroups = {};
  allOptions.forEach((opt) => {
    if (!structuredGroups[opt.fieldGroup]) {
      structuredGroups[opt.fieldGroup] = [];
    }
    structuredGroups[opt.fieldGroup].push(opt);
  });

  return Object.keys(structuredGroups).map((group) => ({
    fieldGroup: group,
    options: structuredGroups[group],
    count: structuredGroups[group].length,
  }));
};

const createOption = async (data) => {
  const { fieldGroup, value, label, icon, sortOrder } = data;
  if (!fieldGroup || !value || !label) {
    throw optionError("Field group, value, and label are required");
  }

  const existing = await prisma.dropdownOption.findUnique({
    where: { fieldGroup_value: { fieldGroup, value } },
  });

  if (existing) {
    throw optionError(`Option with value '${value}' already exists in group '${fieldGroup}'`, 409);
  }

  // Auto-determine sort order if not provided
  let actualSortOrder = sortOrder;
  if (actualSortOrder === undefined) {
    const lastOption = await prisma.dropdownOption.findFirst({
      where: { fieldGroup },
      orderBy: { sortOrder: "desc" },
    });
    actualSortOrder = lastOption ? lastOption.sortOrder + 1 : 1;
  }

  return prisma.dropdownOption.create({
    data: {
      fieldGroup,
      value,
      label,
      icon,
      sortOrder: actualSortOrder,
    },
  });
};

const updateOption = async (optionId, data) => {
  const existing = await prisma.dropdownOption.findUnique({
    where: { optionId: parseInt(optionId) },
  });

  if (!existing) {
    throw optionError("Dropdown option not found", 404);
  }

  const { label, icon, sortOrder, isActive } = data;

  return prisma.dropdownOption.update({
    where: { optionId: parseInt(optionId) },
    data: {
      ...(label !== undefined && { label }),
      ...(icon !== undefined && { icon }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  });
};

const deleteOption = async (optionId) => {
  const existing = await prisma.dropdownOption.findUnique({
    where: { optionId: parseInt(optionId) },
  });

  if (!existing) {
    throw optionError("Dropdown option not found", 404);
  }

  await prisma.dropdownOption.delete({
    where: { optionId: parseInt(optionId) },
  });

  return { message: "Option deleted successfully" };
};

const reorderOptions = async (fieldGroup, orderedIds) => {
  if (!Array.isArray(orderedIds)) {
    throw optionError("orderedIds must be an array");
  }

  // Update in a transaction
  const updates = orderedIds.map((id, index) =>
    prisma.dropdownOption.update({
      where: { optionId: parseInt(id) },
      data: { sortOrder: index + 1 },
    })
  );

  await prisma.$transaction(updates);

  return getOptionsByFieldGroup(fieldGroup, true);
};

module.exports = {
  getOptionsByFieldGroup,
  getAllFieldGroups,
  createOption,
  updateOption,
  deleteOption,
  reorderOptions,
};
