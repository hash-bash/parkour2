import { axiosInstance } from "../utilities/axiosInstance";
import { urlStringStartsWith } from "../utilities/domUtils";

const urlStringStart = urlStringStartsWith();

export const incomingLibrariesApi = {
  getIncomingLibraries() {
    return axiosInstance.get(urlStringStart + "/api/incoming_libraries/");
  },

  setSamplesSubmitted(requestId, submitted) {
    const payload = {
      data: JSON.stringify({
        result: submitted,
      }),
    };
    return axiosInstance.post(
      `${urlStringStart}/api/requests/${requestId}/samples_submitted/`,
      payload,
    );
  },

  updateIncomingLibraries(data) {
    // data should be an array of objects
    const payload = {
      data: JSON.stringify(data),
    };
    return axiosInstance.post(
      `${urlStringStart}/api/incoming_libraries/edit/`,
      payload,
    );
  },

  getTemplates() {
    return axiosInstance.get(
      `${urlStringStart}/api/incoming-libraries-samples-templates/`,
    );
  },

  uploadTemplate(formData) {
    return axiosInstance.post(
      `${urlStringStart}/api/incoming-libraries-samples-templates/upload/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  downloadTemplate(fileId) {
    return axiosInstance.get(
      `${urlStringStart}/api/incoming-libraries-samples-templates/${fileId}/download/`,
      {
        responseType: "blob",
      },
    );
  },

  deleteTemplate(fileId) {
    return axiosInstance.delete(
      `${urlStringStart}/api/incoming-libraries-samples-templates/${fileId}/remove/`,
    );
  },
};
