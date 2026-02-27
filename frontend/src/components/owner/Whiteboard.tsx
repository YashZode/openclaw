import { useCallback } from "react";
import "tldraw/tldraw.css";
import { Tldraw, Editor } from "tldraw";

interface WhiteboardProps {
  venueId: number;
}

export default function Whiteboard({ venueId }: WhiteboardProps) {
  const handleMount = useCallback((editor: Editor) => {
    editor.user.updateUserPreferences({ colorScheme: "dark" });
  }, []);

  return (
    <div className="whiteboard-wrap rounded-xl overflow-hidden border border-white/[0.04]">
      <Tldraw persistenceKey={`3rdseat_whiteboard_${venueId}`} onMount={handleMount} />
    </div>
  );
}
