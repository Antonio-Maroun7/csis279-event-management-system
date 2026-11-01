import { useCallback, useEffect, useState } from "react";
import useDebounce from "../../../shared/hooks/useDebounce";
import useFetch from "../../../shared/hooks/useFetch";
import Alert from "../../../shared/components/ui/Alert";
import EmptyState from "../../../shared/components/ui/EmptyState";
import Pagination from "../../../shared/components/ui/Pagination";
import Spinner from "../../../shared/components/ui/Spinner";
import { getCategories } from "../../categories/services/categoryService";
import { getVenues } from "../../venues/services/venueService";
import EventCard from "../components/EventCard";
import EventFilters from "../components/EventFilters";
import EventsHero from "../components/EventsHero";
import { getEvents } from "../services/eventService";

const PAGE_SIZE = 9;

const EventsView = () => {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim());

  // options of the two filters (loaded once)
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCategories(), getVenues()])
      .then(([categoryData, venueData]) => {
        if (cancelled) return;
        setCategories(categoryData.categories);
        setCities(
          [...new Set(venueData.venues.map((venue) => venue.city))].sort(),
        );
      })
      .catch(() => {
        // the filters stay empty; the events list still works
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // the server filters and paginates the events
  const fetchEvents = useCallback(
    () =>
      getEvents({
        search: debouncedSearch,
        category_id: categoryId,
        city,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, categoryId, city, page],
  );
  const { data, loading, error } = useFetch(fetchEvents);
  const events = data?.events ?? [];

  // every filter change goes back to page 1
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const hasFilters = Boolean(debouncedSearch || categoryId || city);

  return (
    <>
      <EventsHero />

      <section id="upcoming-events" className="mt-4">
        <div className="section-head">
          <div>
            <h2 className="section-title">Upcoming events</h2>
            <p className="subtitle">
              Browse published events and find your next experience.
            </p>
          </div>
          <EventFilters
            search={search}
            categoryId={categoryId}
            city={city}
            categories={categories}
            cities={cities}
            onSearchChange={changeFilter(setSearch)}
            onCategoryChange={changeFilter(setCategoryId)}
            onCityChange={changeFilter(setCity)}
          />
        </div>

        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>

        {loading ? (
          <div className="card">
            <Spinner label="Loading events..." />
          </div>
        ) : events.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="▦"
              title={hasFilters ? "No events found" : "No upcoming events yet"}
              text={
                hasFilters
                  ? "Try another search, category or city."
                  : "New events will appear here as soon as organizers publish them."
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </>
  );
};

export default EventsView;
