"use client";

import { withCn } from "@udecode/cn";

import { Toolbar } from "./toolbar";

export const FixedToolbar = withCn(
  Toolbar,
  "bg-header text-card-foreground absolute z-30 w-full shadow-none shadow rounded-none justify-between overflow-x-auto backdrop-blur scrollbar-hide"
);
