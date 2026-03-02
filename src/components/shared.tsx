import type { ReactNode } from "react";

interface RenderIfProps {
  condition: boolean;
  children: ReactNode;
}

export function RenderIf({ condition, children }: RenderIfProps) {
  return condition ? <>{children}</> : null;
}
