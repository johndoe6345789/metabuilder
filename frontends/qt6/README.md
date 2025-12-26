# Qt6 Frontend (MetaBuilder Landing)

This directory contains a minimal Qt Quick replica of the public MetaBuilder landing page currently rendered by the Next.js `Level1` component.

## Purpose

- Mirror the hero marketing copy, feature highlights, contact CTA, and status overview that appear on `frontends/nextjs`.
- Provide a starting point for building a native Qt6 experience or prototyping desktop/web skins of the MetaBuilder brand.

## Running

1. Install Qt 6 (e.g., via [the official installer](https://www.qt.io/download)) if you don’t already have it.
2. Run the scene with `qmlscene frontends/qt6/FrontPage.qml` (or build the Qt6 project and run `frontends/qt6/main` so the C++ entry point loads `FrontPage.qml`).

You can also embed `main.qml` into a Qt Quick Application project and expose C++ integrations for live data later.
