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
        Explore workshops, talks, sports and community events. Register in
        seconds and stay updated in real time.
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
