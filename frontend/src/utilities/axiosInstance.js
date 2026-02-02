import axios from "axios";
import Cookies from "js-cookie";

export function createAxiosObject() {
  return axios.create({
    withCredentials: true,
    headers: {
      "content-type": "application/json",
      "X-CSRFToken": Cookies.get("csrftoken"),
    },
  });
}

// Default instance if needed, though createAxiosObject seems to be the factory
export const axiosInstance = createAxiosObject();
