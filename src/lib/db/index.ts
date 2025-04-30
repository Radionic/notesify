import * as annotation from "./annotation";
import * as chat from "./chat";
import * as fileSystem from "./file-system";
import * as highlight from "./highlight";
import * as message from "./message";
import * as notes from "./notes";
import * as pdf from "./pdf";
import * as recording from "./recording";

type DBService = {
  annotation: typeof annotation;
  chat: typeof chat;
  message: typeof message;
  fileSystem: typeof fileSystem;
  highlight: typeof highlight;
  notes: typeof notes;
  pdf: typeof pdf;
  recording: typeof recording;
};

export const dbService: DBService = {
  annotation,
  chat,
  message,
  fileSystem,
  highlight,
  notes,
  pdf,
  recording,
};
