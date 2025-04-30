import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../lib/audio/utils";
import { GrBackTen, GrForwardTen } from "react-icons/gr";
import { useAudio } from "react-use";
import { useEffect, useState } from "react";

export const AudioPlayer = ({
  duration,
  recordingUrl,
}: {
  duration: number;
  recordingUrl: string;
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const [audio, state, controls, ref] = useAudio({
    src: recordingUrl,
    autoPlay: false,
  });

  // Update playback speed when it changes
  useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, ref]);

  const handleSkipBackward = () => {
    controls.seek(Math.max(0, state.time - 10));
  };

  const handleSkipForward = () => {
    controls.seek(Math.min(duration, state.time + 10));
  };

  const handleChangePlaybackTime = (value: number) => {
    controls.seek(value);
  };

  return (
    <div className="p-3 flex flex-col gap-2">
      {audio}
      <div className="flex items-center gap-2">
        <div className="text-xs">{formatDuration(state.time)}</div>
        <Slider
          value={[state.time]}
          min={0}
          max={duration}
          step={0.1}
          className="flex-1"
          onValueChange={(value) => handleChangePlaybackTime(value[0])}
        />
        <div className="text-xs">{formatDuration(duration)}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSkipBackward}
          >
            <GrBackTen />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={state.playing ? controls.pause : controls.play}
          >
            {state.playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSkipForward}
          >
            <GrForwardTen />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              {playbackSpeed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {speedOptions.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={cn(
                  "text-xs",
                  playbackSpeed === speed && "bg-neutral-100 font-medium"
                )}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
