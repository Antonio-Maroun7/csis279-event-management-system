import Button from "../components/ui/Button";

const NotFoundView = () => {
  return (
    <div className="not-found">
      <div className="card card-pad not-found-card">
        <div className="eyebrow">ERROR 404</div>
        <h1 className="page-title">Page not found</h1>
        <p className="subtitle">
          The page you are looking for does not exist or was moved.
        </p>
        <Button to="/" className="mt-3">// Go back to the home page
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundView;
