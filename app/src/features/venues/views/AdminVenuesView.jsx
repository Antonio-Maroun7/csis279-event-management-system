import { useState } from "react";
import useFetch from "../../../shared/hooks/useFetch";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";
import ConfirmModal from "../../../shared/components/ui/ConfirmModal";
import EmptyState from "../../../shared/components/ui/EmptyState";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Spinner from "../../../shared/components/ui/Spinner";
import StatCard from "../../../shared/components/ui/StatCard";
import { formatNumber } from "../../../shared/utils/format";
import VenueFilters from "../components/VenueFilters";
import VenueFormModal from "../components/VenueFormModal";
import VenuesTable from "../components/VenuesTable";
import {
  createVenue,
  deleteVenue,
  getVenues,
  updateVenue,
} from "../services/venueService";

const AdminVenuesView = () => {
  // there are only a few venues, so we load them once and filter in the browser
  const { data, loading, error, setError, reload } = useFetch(getVenues);
  const venues = data?.venues ?? [];

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [success, setSuccess] = useState("");

  // form dialog: closed | add (venue = null) | edit (venue = {...})
  const [formOpen, setFormOpen] = useState(false);
  const [venueToEdit, setVenueToEdit] = useState(null);

  const [venueToDelete, setVenueToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // every city once, sorted A-Z (used by the filter and the stats)
  const cities = [...new Set(venues.map((venue) => venue.city))].sort();
  const totalSeats = venues.reduce((sum, venue) => sum + venue.max_capacity, 0);
  const inUseCount = venues.filter((venue) => venue.events_count > 0).length;

  const term = search.trim().toLowerCase();
  const visibleVenues = venues.filter(
    (venue) =>
      (!city || venue.city === city) &&
      (venue.name.toLowerCase().includes(term) ||
        venue.address.toLowerCase().includes(term)),
  );

  const openAddForm = () => {
    setVenueToEdit(null);
    setFormOpen(true);
  };

  const openEditForm = (venue) => {
    setVenueToEdit(venue);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setVenueToEdit(null);
  };

  // errors thrown here are shown inside the dialog by useForm
  const handleSave = async (venueData) => {
    setError("");
    setSuccess("");

    if (venueToEdit) {
      const updated = await updateVenue(venueToEdit.id, venueData);
      setSuccess(`Venue "${updated.name}" was updated.`);
    } else {
      const created = await createVenue(venueData);
      setSuccess(`Venue "${created.name}" was added in ${created.city}.`);
    }

    // the edited city may not exist anymore in the filter
    setCity("");
    closeForm();
    await reload();
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");
      await deleteVenue(venueToDelete.id);
      setSuccess(`Venue "${venueToDelete.name}" was deleted.`);
      setCity("");
      await reload();
    } catch (err) {
      // an event may have started using it: show the new counts first,
      // then the error (reload() clears the error when it succeeds)
      await reload();
      setError(err.message);
    } finally {
      setDeleting(false);
      setVenueToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="SYSTEM ADMINISTRATION"
        title="Venues"
        subtitle="Capacity and location settings used by organizers when they create an event."
        actions={<Button onClick={openAddForm}>＋ Add venue</Button>}
      />

      <div className="grid grid-4">
        <StatCard
          label="Venues"
          value={venues.length}
          icon="⌂"
          hint="Active locations"
        />
        <StatCard
          label="Cities"
          value={cities.length}
          icon="◎"
          hint="Where events take place"
        />
        <StatCard
          label="Total seats"
          value={formatNumber(totalSeats)}
          icon="▦"
          hint="Across all venues"
        />
        <StatCard
          label="In use"
          value={inUseCount}
          icon="✦"
          hint="Hosting at least one event"
        />
      </div>

      <div className="notice notice-info mt-4">
        Administrators manage global venues and categories. Organizers use them
        when creating events.
      </div>

      <div className="section-head mt-4">
        <div>
          <h2 className="section-title">All venues</h2>
          <p className="subtitle">
            Edit a venue at any time. Only unused venues can be deleted.
          </p>
        </div>
        <VenueFilters
          search={search}
          city={city}
          cities={cities}
          onSearchChange={setSearch}
          onCityChange={setCity}
        />
      </div>

      <Alert variant="danger" onClose={() => setError("")} className="mb-3">
        {error}
      </Alert>
      <Alert variant="success" onClose={() => setSuccess("")} className="mb-3">
        {success}
      </Alert>

      {loading ? (
        <div className="card">
          <Spinner label="Loading venues..." />
        </div>
      ) : venues.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="⌂"
            title="No venues yet"
            text="Add the first location so organizers can create events."
            action={<Button onClick={openAddForm}>＋ Add venue</Button>}
          />
        </div>
      ) : visibleVenues.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="⌕"
            title="No venues found"
            text="Try another name, address or city."
          />
        </div>
      ) : (
        <VenuesTable
          venues={visibleVenues}
          onEdit={openEditForm}
          onDelete={setVenueToDelete}
        />
      )}

      <VenueFormModal
        show={formOpen}
        venue={venueToEdit}
        onSubmit={handleSave}
        onClose={closeForm}
      />

      <ConfirmModal
        show={Boolean(venueToDelete)}
        title="Delete this venue?"
        message={
          venueToDelete &&
          `"${venueToDelete.name}" (${venueToDelete.city}) will be removed permanently. Organizers will no longer be able to choose it.`
        }
        confirmLabel="Delete venue"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVenueToDelete(null)}
      />
    </>
  );
};

export default AdminVenuesView;
