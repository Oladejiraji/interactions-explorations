import { useState } from "react";

export default function useCoinFlip() {
  const [activeId, setActiveId] = useState(1);
  const [frontId, setFrontId] = useState(1);
  const [backId, setBackId] = useState(2);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  function handleSelect(id: number) {
    if (id === activeId || isFlipping) return;

    const isShowingFront = flipCount % 2 === 0;

    if (isShowingFront) {
      setBackId(id);
    } else {
      setFrontId(id);
    }

    const next = flipCount + 1;
    setFlipCount(next);
    setIsFlipping(true);
    setActiveId(id);
  }

  function onFlipComplete() {
    setIsFlipping(false);
  }

  return { activeId, frontId, backId, flipCount, isFlipping, handleSelect, onFlipComplete };
}
