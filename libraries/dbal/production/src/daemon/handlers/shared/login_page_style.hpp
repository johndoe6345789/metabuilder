/**
 * @file login_page_style.hpp
 * @brief Shared CSS for the OIDC/SAML/CAS login forms — one small,
 *        dependency-free stylesheet embedded inline (these are plain
 *        server-rendered HTML forms from the C++ daemon, not part of any
 *        frontend's build pipeline), so a single edit here updates the
 *        look of every protocol's login page at once.
 */
#pragma once

#include <string>

namespace dbal::daemon::handlers::shared {

inline const std::string& loginPageStyle() {
    static const std::string style = R"CSS(
<style>
  :root {
    color-scheme: light dark;
    --bg: #f4f5f7;
    --card-bg: #ffffff;
    --text: #1b1f24;
    --text-muted: #5c6470;
    --border: #d9dce1;
    --accent: #4f46e5;
    --accent-hover: #4338ca;
    --error-bg: #fdecec;
    --error-text: #b3261e;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14161a;
      --card-bg: #1e2126;
      --text: #e8eaed;
      --text-muted: #9aa1ab;
      --border: #2e323a;
      --accent: #818cf8;
      --accent-hover: #a5b4fc;
      --error-bg: #3a1f1f;
      --error-text: #f2a8a3;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 24px;
  }
  .card {
    width: 100%;
    max-width: 380px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 28px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .brand {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 6px;
  }
  h1 {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 24px;
  }
  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    margin-bottom: 6px;
  }
  .field { margin-bottom: 18px; }
  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 10px 12px;
    font-size: 15px;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: none;
    transition: border-color 0.15s ease;
  }
  input[type="text"]:focus,
  input[type="password"]:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
  }
  button[type="submit"] {
    width: 100%;
    padding: 11px 12px;
    margin-top: 4px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: var(--accent);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  button[type="submit"]:hover { background: var(--accent-hover); }
  button[type="submit"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 18px 0;
    color: var(--text-muted);
    font-size: 12px;
  }
  .divider::before, .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  button.turbo {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    background: transparent;
    border: 1.5px solid var(--accent);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  button.turbo:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }
  .error {
    background: var(--error-bg);
    color: var(--error-text);
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 8px;
    margin: 0 0 18px;
  }
  .footnote {
    margin-top: 20px;
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
  }
</style>
)CSS";
    return style;
}

} // namespace dbal::daemon::handlers::shared
