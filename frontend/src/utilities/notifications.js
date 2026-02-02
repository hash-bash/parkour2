import { useToast } from "vue-toastification";

const toast = useToast();

export function showNotification(content, type) {
  let options = {
    timeout: 5000,
    position: "top-left",
  };

  if (type === "info") toast.info(content, options);
  else if (type === "success") toast.success(content, options);
  else if (type === "error") toast.error(content, options);
  else if (type === "warning") toast.warning(content, options);
}
