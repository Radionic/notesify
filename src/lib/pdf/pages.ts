export const getPageNumber = (target: HTMLElement) => {
  const node = target.closest(".page");
  if (!(node instanceof HTMLElement)) {
    return null;
  }
  return Number(node.dataset.pageNumber);
};

export const getPagesFromRange = (container: HTMLDivElement, range: Range) => {
  const startParentElement = range.startContainer.parentElement;
  const endParentElement = range.endContainer.parentElement;
  if (!startParentElement || !endParentElement) {
    return null;
  }

  const startPage = getPageNumber(startParentElement);
  const endPage = getPageNumber(endParentElement);
  if (!startPage || !endPage) {
    return null;
  }

  const pages = [];
  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
    const page = container.querySelector(`[data-page-number='${pageNumber}']`);
    if (page instanceof HTMLElement) {
      pages.push(page);
    }
  }
  return pages;
};

export const getPage = (pageNumber?: number) => {
  if (!pageNumber) return null;
  const pageEl = document.querySelector(
    `.page[data-page-number="${pageNumber}"]`,
  );
  if (!(pageEl instanceof HTMLElement)) return null;
  return pageEl;
};
