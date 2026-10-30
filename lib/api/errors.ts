/**
 * Pulls the user-readable message out of an API error.
 *
 * The v2 API puts it in `message` (409 / 422 / 404), but withdraw errors put
 * the real reason in `errors.message`. Hooks that already re-throw as a plain
 * Error keep it on `error.message`.
 */
export const getApiErrorMessage = (error: any, fallback = "Something went wrong. Please try again."): string => {
  const data = error?.response?.data;
  return (
    data?.errors?.message ||
    data?.message ||
    (typeof error?.message === "string" && !error.message.startsWith("Request failed with status")
      ? error.message
      : null) ||
    fallback
  );
};

export const getApiErrorStatus = (error: any): number | undefined => error?.response?.status;
