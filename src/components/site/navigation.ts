function trimPath(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function isNavigationItemActive(pathname: string, href: string) {
  const currentPath = trimPath(pathname);
  const targetPath = trimPath(href);

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return (
    currentPath === targetPath ||
    currentPath.endsWith(targetPath) ||
    currentPath.includes(`${targetPath}/`)
  );
}
