import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export function LoadingState({ 
  message = "Generating your trip...", 
  submessage = "This may take a few moments" 
}: LoadingStateProps) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600 font-medium" data-testid="loading-message">{message}</p>
        <p className="text-sm text-gray-500 mt-2" data-testid="loading-submessage">{submessage}</p>
      </div>
    </div>
  );
}
