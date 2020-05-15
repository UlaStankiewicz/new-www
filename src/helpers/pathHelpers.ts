export const getUrlForAbsolutePath = (path: string) => {
  return path.split("pages").pop().replace(".md", "")
}
