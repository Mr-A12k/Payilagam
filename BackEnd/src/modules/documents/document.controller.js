const documentService = require('./document.service');
const { success, error } = require('../../utils/responseHelper');

exports.uploadDocument = async (request, response) => {
    try {
        if (!request.file) {
            return error(response, "No file uploaded.", 400);
        }

        const { title, topic } = request.body;
        if (!title) {
            return error(response, "Title is required.", 400);
        }

        const doc = await documentService.uploadDocument(request.user.userId, request.file, title, topic);
        return success(response, doc, "Document uploaded and is processing.", 201);
    } catch (error) {
        return error(response, error.message, 500);
    }
};

exports.getAllDocuments = async (request, response) => {
    try {
        const docs = await documentService.getAllDocuments();
        return success(response, docs, "Documents retrieved", 200);
    } catch (error) {
        return error(response, error.message, 500);
    }
};

exports.deleteDocument = async (request, response) => {
    try {
        const { id } = request.params;
        await documentService.deleteDocument(id);
        return success(response, null, "Document deleted successfully.", 200);
    } catch (error) {
        return error(response, error.message, 500);
    }
};
