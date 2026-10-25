import BrandLogo from "../ui/BrandLogo";

/**
 * Split screen used by login, register and 2FA pages:
 * purple art panel on the left, the form on the right.
 */
const AuthLayout = ({ eyebrow, title, text, features = [], children }) => {
  return (
    <div className="auth-shell">
      <section className="auth-art">
        <BrandLogo to="/login" />

        <div className="auth-copy">
          <div className="eyebrow auth-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>

        <div className="auth-features">
          {features.map((feature) => (
            <div className="auth-feature" key={feature.title}>
              <b>{feature.title}</b>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-form">{children}</div>
      </section>
    </div>
  );
};

export default AuthLayout;
