export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    if ("message" in err && typeof err.message === "string") {
      return err.message;
    }
    if ("detail" in err && typeof err.detail === "string") {
      return err.detail;
    }
  }

  return "Something went wrong";
};
