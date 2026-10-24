import { Link } from "react-router-dom";
import Spinner from "./Spinner";

/**
 * Button with the design system styles.
 * variant: primary | secondary | ghost | danger | success | dark
 * Pass `to` to render a router Link that looks like a button.
 */
const Button = ({
  variant = "primary", // the variant of the button (primary, secondary, ghost, danger, success, dark)
  size, // the size of the button (sm for small)
  full = false, // whether the button should take the full width of its container
  loading = false, // whether the button should show a loading spinner
  to,
  className = "",
  children, // the content of the button
  disabled, // whether the button should be disabled
  type = "button", // the type of the button element (button, submit, reset)
  ...props
}) => {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" && "btn-sm",
    full && "btn-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;
