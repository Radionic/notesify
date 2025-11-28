export const replaceImageReferences = (text: string, images: string[]) => {
  // Replace ![img-X.jpeg](img-X.jpeg) with ![](base64 image)
  const imgPattern = /!\[img-(\d+).jpeg\]\(img-\d+\.jpeg\)/g;
  const res = text.replace(imgPattern, (match: string, index: string) => {
    const imgIndex = parseInt(index);
    if (imgIndex >= 0 && imgIndex < images.length && images[imgIndex]) {
      return `![](${images[imgIndex]})`;
    }
    // Return original match if no replacement is possible
    return match;
  });
  return res;
};
