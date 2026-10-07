const documentService = require("./document.service");
const { success, error } = require("../../utils/responseHelper");

exports.uploadDocument = async (request, response) => {
  try {
    if (!request.file) {
      return error(response, "No file uploaded.", 400);
    }

    const { title, topic } = request.body;
    if (typeof title !== 'string' || !title.trim()) {
      require('fs').unlinkSync(request.file.path);
      return error(response, "Title is required.", 400);
    }

    const doc = await documentService.uploadDocument(
      request.user.userId,
      request.file,
      title.trim(),
      topic,
    );
    return success(response, doc, "Document uploaded and is processing.", 201);
  } catch (err) {
    if (request.file) await require('fs').promises.unlink(request.file.path).catch(() => {});
    return error(response, err.statusCode ? err.message : 'Document upload failed', err.statusCode || 500);
  }
};

exports.getAllDocuments = async (request, response) => {
  try {
    const docs = await documentService.getAllDocuments();
    return success(response, docs, "Documents retrieved", 200);
  } catch (err) {
    return error(response, 'Could not load documents', err.statusCode || 500);
  }
};

exports.deleteDocument = async (request, response) => {
  try {
    const { id } = request.params;
    await documentService.deleteDocument(id, request.user);
    return success(response, null, "Document deleted successfully.", 200);
  } catch (err) {
    return error(response, err.statusCode ? err.message : 'Document deletion failed', err.statusCode || 500);
  }
};
