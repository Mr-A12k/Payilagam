const resourceService = require("./resource.service");
const {
  success: successResponse,
  error: errorResponse,
} = require("../../utils/responseHelper");
const catchAsync = require("../../utils/catchAsync");

const resourceController = {
  uploadResource: catchAsync(async (request, response, next) => {
    if (!request.file) {
      return errorResponse(response, "No file uploaded", 400);
    }

    const { title, description, category } = request.body;
    const uploaderId = request.user.userId;

    if (!title || !category) {
      return errorResponse(response, "Title and category are required", 400);
    }

    // Determine file type from extension or mime type
    const fileExt = request.file.originalname.split(".").pop().toLowerCase();
    let type = "file";
    if (["pdf"].includes(fileExt)) type = "pdf";
    else if (["png", "jpg", "jpeg", "gif"].includes(fileExt)) type = "image";
    else if (["mp4", "mov", "avi", "mkv"].includes(fileExt)) type = "video";
    else if (["doc", "docx", "xls", "xlsx"].includes(fileExt))
      type = "document";

    const fileUrl = `/resources/${request.file.filename}`;

    const resource = await resourceService.createResource({
      title,
      description,
      category,
      type,
      sizeBytes: request.file.size,
      fileUrl,
      uploaderId,
    });

    return successResponse(
      response,
      resource,
      "Resource uploaded successfully",
      201,
    );
  }),

  getAllResources: catchAsync(async (request, response, next) => {
    const { category, search } = request.query;
    const resources = await resourceService.getAllResources({
      category,
      search,
    });
    return successResponse(
      response,
      resources,
      "Resources fetched successfully",
    );
  }),

  downloadResource: catchAsync(async (request, response, next) => {
    const { id } = request.params;
    const resource = await resourceService.incrementDownload(id);

    // We return the file URL to the frontend, and the frontend triggers the download
    return successResponse(
      response,
      { fileUrl: resource.fileUrl },
      "Download tracked",
    );
  }),

  deleteResource: catchAsync(async (request, response, next) => {
    const { id } = request.params;

    // Check if resource exists
    const resource = await resourceService.getResourceById(id);
    if (!resource) {
      return errorResponse(response, "Resource not found", 404);
    }

    // Delete from DB (this should cascade delete related Reports if Prisma schema is configured for it,
    // but Prisma default is often Restrict if not explicit. We'll delete it from DB first)
    await resourceService.deleteResource(id);

    // Try to delete physical file
    if (resource.fileUrl) {
      try {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(__dirname, "../../", resource.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error("Error deleting physical file:", error);
      }
    }

    return successResponse(response, null, "Resource deleted successfully");
  }),
};

module.exports = resourceController;
