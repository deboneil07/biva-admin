export const convertUrlsToPublicId = async (urls: string[]) => {
  return urls.map((url) => {
    const parts = url.split(/\/v\d+\//);
    if (parts.length > 1) {
      let publicIdWithExtension = parts[1];
      let publicIdWithoutQuery = publicIdWithExtension?.split("?")[0];
      return publicIdWithoutQuery?.replace(/\.\w+$/, "");
    }
  });
};
