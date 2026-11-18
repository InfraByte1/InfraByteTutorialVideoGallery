import React from "react";
import { usePreferences } from "../contexts/PreferencesContext";
// Imported (not referenced by path) so the build bundles and hashes them and
// they resolve correctly in production.
import logoLight from "../Assets/images/logo.png"; // dark lettering: light backgrounds
import logoDark from "../Assets/images/logo-dark.png"; // white lettering: dark theme
import logoOnDark from "../Assets/images/infrabyte-logo-dark-bg.png"; // always-dark surfaces

/**
 * InfraByte logo.
 * - surface="theme" (default): follows the viewer's light/dark theme. Use on
 *   surfaces that change with the theme (e.g. the navbar).
 * - surface="dark": always the white-lettered logo. Use on surfaces that are
 *   dark in both themes (landing/hub hero, footer).
 */
const BrandLogo = ({ surface = "theme", alt = "InfraByte", ...imgProps }) => {
  const { theme } = usePreferences();
  const src =
    surface === "dark"
      ? logoOnDark
      : theme === "light"
        ? logoLight
        : logoDark;
  return <img src={src} alt={alt} {...imgProps} />;
};

export default BrandLogo;
