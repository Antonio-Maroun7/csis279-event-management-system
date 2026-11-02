/**
 * Dark banner at the top of Events Home.
 * "Explore events" scrolls down to the list.
 */
const EventsHero = () => {
  return (
    <section className="hero">
      <div className="eyebrow hero-eyebrow">
        DISCOVER • CONNECT • EXPERIENCE
      </div>
      <h1>Find an event worth remembering.</h1>
      <p>
        Explore workshops, talks, sports and community events and find the one
        that fits you.
      </p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#upcoming-events">
          Explore events
        </a>
      </div>
    </section>
  );
};

export default EventsHero;
