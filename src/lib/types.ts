// export type BBox = {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// };

// export type BBox = {
//   top: number;
//   right: number;
//   bottom: number;
//   left: number;
// };

export type Position = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type PagedPosition = Position & {
  page: number;
};

export type Rect = {
  page: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type TextSelection = {
  text: string;
  rects: Rect[];
};
