const prisma = require('../../config/prisma');

const resourceService = {
  createResource: async (data) => {
    return await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        sizeBytes: data.sizeBytes,
        fileUrl: data.fileUrl,
        uploaderId: data.uploaderId
      }
    });
  },

  getAllResources: async (filters = {}) => {
    const where = {};
    if (filters.category && filters.category !== 'All') {
      where.category = filters.category;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.resource.findMany({
      where,
      include: {
        uploader: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  incrementDownload: async (resourceId) => {
    return await prisma.resource.update({
      where: { resourceId: Number(resourceId) },
      data: { downloads: { increment: 1 } }
    });
  },

  getResourceById: async (resourceId) => {
    return await prisma.resource.findUnique({
      where: { resourceId: Number(resourceId) }
    });
  },

  deleteResource: async (resourceId) => {
    // Delete related reports first to avoid foreign key constraints
    await prisma.report.deleteMany({
      where: { resourceId: Number(resourceId) }
    });
    
    return await prisma.resource.delete({
      where: { resourceId: Number(resourceId) }
    });
  }
};

module.exports = resourceService;
