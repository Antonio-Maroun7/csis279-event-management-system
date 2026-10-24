/**
 * Loading indicator.
 * <Spinner /> small inline spinner
 * <Spinner label="Loading users..." /> spinner with text, centered in a block
 */
const Spinner = ({ size = "md", label }) => {
  //
  const circle = (
    <span className={`spinner spinner-${size}`} aria-hidden="true" />
  );

  if (!label) {
    // if no label is provided, just return the spinner circle
    return circle; // return only the spinner circle if no label is provided
  }

  return (
    <div className="loading-block" role="status">
      {circle}
      <span>{label}</span>
    </div>
  );
};

export default Spinner;
