import apiFetch from "../../../shared/api/apiFetch";
import { toQueryString } from "../../../shared/utils/format";

// ── Public ───────────────────────────────────────────────────

/** GET /api/categories?search= -> { categories, total } */
export const getCategories = (filters) =>
  apiFetch(`/categories${toQueryString(filters)}`);

// ── Admin ────────────────────────────────────────────────────

/** POST /api/categories -> created category */
export const createCategory = async (name) => {
  const result = await apiFetch("/categories", {
    method: "POST",
    body: { name },
  });
  return result.category;
};

/** PUT /api/categories/:id -> renamed category */
export const updateCategory = async (id, name) => {
  const result = await apiFetch(`/categories/${id}`, {
    method: "PUT",
    body: { name },
  });
  return result.category;
};

/** DELETE /api/categories/:id (fails with 409 when events use it) */
export const deleteCategory = (id) =>
  apiFetch(`/categories/${id}`, { method: "DELETE" });
