import React, { useEffect, useRef } from "react";

export default function TermsModal({ onClose, onAgree }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    modalRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="term-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="term-title"
      onClick={onClose}
    >
      <div
        className="term-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="term-header">
          <h4 id="term-title" className="mb-0">Terms & Conditions</h4>
          <button
            type="button"
            className="term-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="term-body">
          <p className="term-muted">
            The Terms & Conditions for PortManager.
            By using the application you agree to these Terms.
          </p>

          <h5> Header 1</h5>
          <p>
            test info
          </p>

          <h5>Header 1</h5>
          <p>
            test info
          </p>

          <h5>Header 1</h5>
          <p>
            test info
          </p>

          <h5>Header 1</h5>
          <p>
            test info
          </p>
        </div>

        <div className="term-footer">
          <button type="button" className="term-action" onClick={onAgree}>
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
