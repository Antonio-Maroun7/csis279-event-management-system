import { useRef } from "react";

/**
 * Six boxes for a one-time code (2FA). Typing moves to the next box,
 * Backspace goes back, and pasting "381407" fills every box.
 *
 * <CodeInput value={code} onChange={setCode} autoFocus />
 *
 * `value` is a string; an empty box is stored as a space so the positions never move.
 */
const CodeInput = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  invalid = false,
}) => {
  const inputsRef = useRef([]);

  const digits = value
    .padEnd(length, " ")
    .slice(0, length)
    .split("")
    .map((char) => (char === " " ? "" : char));

  const focusBox = (index) => {
    const safeIndex = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[safeIndex]?.focus();
  };

  const emit = (nextDigits) => {
    onChange(
      nextDigits
        .map((digit) => digit || " ")
        .join("")
        .trimEnd(),
    );
  };

  const handleChange = (index, event) => {
    const typed = event.target.value.replace(/\D/g, "");
    if (!typed) {
      return;
    }

    // one digit typed, or several pasted: fill from this box forward
    const next = [...digits];
    typed.split("").forEach((digit, offset) => {
      if (index + offset < length) {
        next[index + offset] = digit;
      }
    });
    emit(next);
    focusBox(index + typed.length);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
      } else if (index > 0) {
        next[index - 1] = "";
        focusBox(index - 1);
      }
      emit(next);
    } else if (event.key === "ArrowLeft") {
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      focusBox(index + 1);
    }
  };

  return (
    <div className="code-grid" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          className={`code-box ${invalid ? "is-invalid" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default CodeInput;
