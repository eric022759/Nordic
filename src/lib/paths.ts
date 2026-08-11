const ABSOLUTE_OR_SPECIAL_PATH = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

function normalizeBasePath(value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubPagesBasePath =
  process.env.GITHUB_ACTIONS === "true" && repositoryName
    ? `/${repositoryName}`
    : "";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

/** The path prefix used when the static export is hosted on GitHub Pages. */
export const basePath = normalizeBasePath(
  configuredBasePath ?? githubPagesBasePath,
);

/** Prefix a root-relative public asset with the current deployment base path. */
export function withBasePath(pathname: string): string {
  if (!pathname) {
    return basePath || "/";
  }

  if (ABSOLUTE_OR_SPECIAL_PATH.test(pathname)) {
    return pathname;
  }

  const normalizedPath = `/${pathname.replace(/^\/+/, "")}`;

  if (
    !basePath ||
    normalizedPath === basePath ||
    normalizedPath.startsWith(`${basePath}/`)
  ) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}

/** Alias that reads naturally at image and icon call sites. */
export const assetPath = withBasePath;

/** Remove the deployment prefix from a browser pathname when it is present. */
export function withoutBasePath(pathname: string): string {
  if (!basePath || pathname === basePath) {
    return pathname === basePath ? "/" : pathname;
  }

  return pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length)
    : pathname;
}
