import { axiosInstance } from "../utilities/axiosInstance";
import { urlStringStartsWith } from "../utilities/domUtils";

const urlStringStart = urlStringStartsWith();

export const dutiesApi = {
  getDuties(params = "") {
    return axiosInstance.get(
      urlStringStart + "/api/duties/" + (params ? "?" + params : ""),
    );
  },

  createDuty(dutyData) {
    return axiosInstance.post(urlStringStart + "/api/duties/", dutyData);
  },

  updateDuty(dutyId, dutyData) {
    return axiosInstance.patch(
      urlStringStart + "/api/duties/" + String(dutyId) + "/",
      dutyData,
    );
  },

  getResponsibles() {
    return axiosInstance.get(urlStringStart + "/api/duties/responsibles/");
  },
};
