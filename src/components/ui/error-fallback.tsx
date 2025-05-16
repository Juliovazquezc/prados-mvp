import { type FC } from "react";
import { type FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";

export const ErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-semibold text-destructive">
        Something went wrong
      </h2>
      <pre className="max-w-lg rounded-lg bg-muted p-4 text-sm">
        {error.message}
      </pre>
      <Button onClick={resetErrorBoundary} variant="outline" className="mt-4">
        Try again
      </Button>
    </div>
  );
};
