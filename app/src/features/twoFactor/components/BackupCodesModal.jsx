import { useState } from "react";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";

/**
 * Shows the new backup codes once, with copy and download buttons.
 */
const BackupCodesModal = ({ codes, onClose }) => {
  const [copied, setCopied] = useState(false);

  const text = (codes || []).join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const file = new Blob(
      [`EventFlow backup codes\nEach code works only once.\n\n${text}\n`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "eventflow-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      show={Boolean(codes)}
      title="Save your backup codes"
      icon="⚿"
      onClose={handleClose}
    >
      <p>
        Each code can be used once to sign in without your authenticator app.
        They will not be shown again.
      </p>

      <div className="backup-codes">
        {(codes || []).map((code) => (
          <span key={code} className="backup-code">
            {code}
          </span>
        ))}
      </div>

      <div className="modal-actions">
        <Button variant="ghost" onClick={handleCopy}>
          {copied ? "Copied ✓" : "Copy"}
        </Button>
        <Button variant="ghost" onClick={handleDownload}>
          Download .txt
        </Button>
        <Button onClick={handleClose}>I saved them</Button>
      </div>
    </Modal>
  );
};

export default BackupCodesModal;
