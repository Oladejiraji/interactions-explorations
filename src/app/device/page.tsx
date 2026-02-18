"use client";

import { useCallback, useEffect, useState } from "react";

interface OrientationData {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export default function Device() {
  const [orientation, setOrientation] = useState<OrientationData>({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied" | "unsupported"
  >("prompt");

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    setOrientation({
      alpha: e.alpha !== null ? Math.round(e.alpha * 100) / 100 : null,
      beta: e.beta !== null ? Math.round(e.beta * 100) / 100 : null,
      gamma: e.gamma !== null ? Math.round(e.gamma * 100) / 100 : null,
    });
  }, []);

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission request via user gesture
    const DeviceOrientationEvt =
      DeviceOrientationEvent as unknown as DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };

    if (typeof DeviceOrientationEvt.requestPermission === "function") {
      try {
        const result = await DeviceOrientationEvt.requestPermission();
        if (result === "granted") {
          setPermissionState("granted");
          window.addEventListener("deviceorientation", handleOrientation);
        } else {
          setPermissionState("denied");
        }
      } catch {
        setPermissionState("denied");
      }
    } else {
      // Non-iOS browsers — just listen directly
      setPermissionState("granted");
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) {
      setPermissionState("unsupported");
      return;
    }

    // On non-iOS, we can start listening immediately
    const DeviceOrientationEvt =
      DeviceOrientationEvent as unknown as DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };

    if (typeof DeviceOrientationEvt.requestPermission !== "function") {
      setPermissionState("granted");
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleOrientation]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-black text-white">
      <h1 className="mb-8 text-2xl font-bold">Device Orientation</h1>

      {permissionState === "unsupported" && (
        <p className="text-red-400">
          Device orientation is not supported on this browser.
        </p>
      )}

      {permissionState === "prompt" && (
        <button
          type="button"
          onClick={requestPermission}
          className="rounded-lg bg-white px-6 py-3 text-lg font-medium text-black transition-opacity active:opacity-70"
        >
          Enable Orientation
        </button>
      )}

      {permissionState === "denied" && (
        <p className="text-red-400">
          Permission denied. Allow motion access in your browser settings.
        </p>
      )}

      {permissionState === "granted" && (
        <div className="grid gap-6 text-center font-mono text-lg">
          <div>
            <p className="mb-1 text-sm text-neutral-400">Alpha (z-axis)</p>
            <p className="text-4xl">{orientation.alpha ?? "—"}&deg;</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-neutral-400">Beta (x-axis)</p>
            <p className="text-4xl">{orientation.beta ?? "—"}&deg;</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-neutral-400">Gamma (y-axis)</p>
            <p className="text-4xl">{orientation.gamma ?? "—"}&deg;</p>
          </div>
        </div>
      )}
    </div>
  );
}
