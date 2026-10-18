// https://vike.dev/Head

import faviconUrl from "../assets/favicon.svg";

export function Head() {
  return (
    <>
      <link rel="icon" href={faviconUrl} />
      <meta name="theme-color" content="#2563eb" />
    </>
  );
}
