import { useState } from "react";
import useFetch from "../../../shared/hooks/useFetch";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import ConfirmModal from "../../../shared/components/ui/ConfirmModal";
import EmptyState from "../../../shared/components/ui/EmptyState";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Spinner from "../../../shared/components/ui/Spinner";
import StatCard from "../../../shared/components/ui/StatCard";
import CategoriesTable from "../components/CategoriesTable";
import CategoryFilters from "../components/CategoryFilters";
import CategoryFormModal from "../components/CategoryFormModal";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categoryService";

const AdminCategoriesView = () => {
  // there are only a few categories, so we load them once and search in the browser
  const { data, loading, error, setError, reload } = useFetch(getCategories);
  const categories = data?.categories ?? [];

  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");

  // form dialog: closed | add (category = null) | rename (category = {...})
  const [formOpen, setFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const term = search.trim().toLowerCase();
  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(term),
  );
  const inUseCount = categories.filter((c) => c.events_count > 0).length;

  const openAddForm = () => {
    setCategoryToEdit(null);
    setFormOpen(true);
  };

  const openRenameForm = (category) => {
    setCategoryToEdit(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setCategoryToEdit(null);
  };

  // errors thrown here are shown inside the dialog by useForm
  const handleSave = async (name) => {
    setError("");
    setSuccess("");

    if (categoryToEdit) {
      const updated = await updateCategory(categoryToEdit.id, name);
      setSuccess(`"${categoryToEdit.name}" was renamed to "${updated.name}".`);
    } else {
      const created = await createCategory(name);
      setSuccess(`Category "${created.name}" was added.`);
    }

    closeForm();
    await reload();
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");
      await deleteCategory(categoryToDelete.id);
      setSuccess(`Category "${categoryToDelete.name}" was deleted.`);
      await reload();
    } catch (err) {
      // an event may have started using it: show the new counts first,
      // then the error (reload() clears the error when it succeeds)
      await reload();
      setError(err.message);
    } finally {
      setDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="SYSTEM ADMINISTRATION"
        title="Categories"
        subtitle="Reusable event types that organizers pick when they create an event."
        actions={<Button onClick={openAddForm}>＋ Add category</Button>}
      />

      <div className="grid grid-3">
        <StatCard
          label="Categories"
          value={categories.length}
          icon="#"
          hint="Event types"
        />
        <StatCard
          label="In use"
          value={inUseCount}
          icon="▦"
          hint="Used by at least one event"
        />
        <StatCard
          label="Unused"
          value={categories.length - inUseCount}
          icon="○"
          hint="Can be deleted"
        />
      </div>

      <div className="notice notice-info mt-4">
        Administrators manage global venues and categories. Organizers use them
        when creating events.
      </div>

      <div className="section-head mt-4">
        <div>
          <h2 className="section-title">All categories</h2>
          <p className="subtitle">
            Rename a category at any time. Only unused categories can be
            deleted.
          </p>
        </div>
        <CategoryFilters search={search} onSearchChange={setSearch} />
      </div>

      <Alert variant="danger" onClose={() => setError("")} className="mb-3">
        {error}
      </Alert>
      <Alert variant="success" onClose={() => setSuccess("")} className="mb-3">
        {success}
      </Alert>

      {loading ? (
        <div className="card">
          <Spinner label="Loading categories..." />
        </div>
      ) : categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="#"
            title="No categories yet"
            text="Add the first event type so organizers can use it."
            action={<Button onClick={openAddForm}>＋ Add category</Button>}
          />
        </div>
      ) : visibleCategories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="⌕"
            title="No categories found"
            text={`Nothing matches "${search.trim()}".`}
          />
        </div>
      ) : (
        <CategoriesTable
          categories={visibleCategories}
          onRename={openRenameForm}
          onDelete={setCategoryToDelete}
        />
      )}

      <CategoryFormModal
        show={formOpen}
        category={categoryToEdit}
        onSubmit={handleSave}
        onClose={closeForm}
      />

      <ConfirmModal
        show={Boolean(categoryToDelete)}
        title="Delete this category?"
        message={
          categoryToDelete &&
          `"${categoryToDelete.name}" will be removed permanently. Organizers will no longer be able to choose it.`
        }
        confirmLabel="Delete category"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </>
  );
};

export default AdminCategoriesView;
