/**
 * ValidationResults - Renders validation errors, warnings, or success
 */

import React from 'react';

const CHECK_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
      10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5
      1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const WARN_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export default function ValidationResults({
  validation,
}: {
  validation: ValidationResult;
}) {
  if (validation.valid) {
    return (
      <div className="alert alert-success">
        {CHECK_SVG}
        <div>
          <p>Workflow is valid and ready to execute</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {validation.errors.length > 0 && (
        <div className="alert alert-error">
          {WARN_SVG}
          <div>
            <p>Errors:</p>
            <ul>
              {validation.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div className="alert alert-warning">
          {WARN_SVG}
          <div>
            <p>Warnings:</p>
            <ul>
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
