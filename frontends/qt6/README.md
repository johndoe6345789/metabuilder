# Qt6 Frontend (MetaBuilder Landing)

This directory contains a minimal Qt Quick replica of the public MetaBuilder landing page currently rendered by the Next.js `Level1` component.

## Purpose

- Mirror the hero marketing copy, feature highlights, contact CTA, and status overview that appear on `frontends/nextjs`.
- Provide a starting point for building a native Qt6 experience or prototyping desktop/web skins of the MetaBuilder brand.

## Running

1. Install Qt 6 (e.g., via [the official installer](https://www.qt.io/download)) if you don’t already have it.
2. Run the scene with `qmlscene frontends/qt6/FrontPage.qml` (or build the Qt6 project and run `frontends/qt6/main` so the C++ entry point loads `FrontPage.qml`).

You can also embed `main.qml` into a Qt Quick Application project and expose C++ integrations for live data later.

## Component library

- Shared QML components live under `frontends/qt6/qmllib/MetaBuilder`.
- Import them via `import "qmllib/MetaBuilder" as MetaBuilder` and reuse `MetaBuilder.NavBar`, `MetaBuilder.HeroSection`, `MetaBuilder.FeatureCard`, `MetaBuilder.StatusCard`, and `MetaBuilder.ContactForm` to keep future pages consistent.

## Material UI rendition

- Material-inspired components live under `frontends/qt6/qmllib/Material` and provide palette tokens plus buttons, cards, text fields, chips, and sample layouts.
- Import them with `import "qmllib/Material" as Material` and reference `Material.MaterialButton`, `Material.MaterialCard`, `Material.MaterialTextField`, `Material.MaterialChip`, and the singleton palette `Material.MaterialPalette`.
- Use `Material.MaterialSurface` and `Material.MaterialDivider` to group controls with Material elevation, spacing, and dividers.
- `Material.MaterialButton` now supports icon sources and a built-in ripple animation so interactions feel tactile.
- Preview the Material view with `qmlscene frontends/qt6/MaterialLanding.qml` or embed it into your Qt Quick application to reuse the tokens and components across other screens.
