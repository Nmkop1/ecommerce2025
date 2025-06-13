"use client";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ProductWatch({ productId }: { productId: string }) {
  const [watcherCount, setWatcherCount] = useState<number>(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const min = 1;
    const max = 10;

    setWatcherCount  (Math.floor(Math.random() * (max - min + 1) + min));
  }, [productId]);
  if (watcherCount > 0) {
    return (
      <div className="mb-2 text-sm">
        <p className="flex items-center gap-x-1">
          <Eye className="w-4 text-main-secondary" />
          <span>
            {watcherCount  } {watcherCount > 1 ? "osoba" : "osób"}
            &nbsp;ogląda ten produkt
          </span>
        </p>
      </div>
    );
  }
}
