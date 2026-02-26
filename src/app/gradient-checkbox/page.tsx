"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

const CIRCLE_COUNT = 80;
const CIRCLE_SIZE = 140;
const X_SPACING = 2;
const TOTAL_SPREAD = (CIRCLE_COUNT - 1) * X_SPACING;
const INDICATOR_SIZE = 170;

const UNCHECKED_HUE = { start: 120, end: 195 }; // green → teal
const CHECKED_HUE = { start: 270, end: 340 }; // purple → pink

export default function GradientCheckbox() {
	const [checked, setChecked] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const hasToggled = useRef(false);

	const toggle = () => {
		if (isAnimating) return;
		hasToggled.current = true;
		setIsAnimating(true);
		setChecked((prev) => !prev);
	};

	const containerWidth = CIRCLE_SIZE + TOTAL_SPREAD;

	// Indicator center positions
	const leftCenter = CIRCLE_SIZE / 2;
	const rightCenter = TOTAL_SPREAD + CIRCLE_SIZE / 2;

	const indicatorLeft = checked ? rightCenter : leftCenter;
	const indicatorKeyframes = hasToggled.current
		? checked
			? [leftCenter, rightCenter, rightCenter]
			: [rightCenter, leftCenter, leftCenter]
		: undefined;

	return (
		<main className="w-screen h-screen flex justify-center items-center bg-neutral-950">
			<div
				className="relative cursor-pointer"
				onClick={toggle}
				style={{
					width: containerWidth,
					height: CIRCLE_SIZE,
				}}
			>
				{Array.from({ length: CIRCLE_COUNT }, (_, i) => (
					<GradientCircle
						key={i}
						index={i}
						checked={checked}
						hasToggled={hasToggled.current}
						onComplete={
							i === 0 ? () => setIsAnimating(false) : undefined
						}
					/>
				))}

				{/* Indicator: white circle with plus icon */}
				<motion.div
					className="absolute flex items-center justify-center rounded-full z-10"
					style={{
						width: INDICATOR_SIZE,
						height: INDICATOR_SIZE,
						border: "2px solid white",
						top: "50%",
						y: "-50%",
						x: "-50%",
					}}
					animate={
						indicatorKeyframes
							? { left: indicatorKeyframes }
							: { left: indicatorLeft }
					}
					transition={
						indicatorKeyframes
							? {
									duration: 1,
									times: [0, 0.5, 1],
									ease: [
										[0.4, 0, 0.2, 1],
										[0.8, 0, 0.2, 1],
									],
								}
							: { duration: 0 }
					}
				>
					<motion.div
						animate={{ rotate: checked ? 180 : 0 }}
						transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
					>
						<Plus size={28} strokeWidth={2} className="text-white" />
					</motion.div>
				</motion.div>
			</div>
		</main>
	);
}

function GradientCircle({
	index,
	checked,
	hasToggled,
	onComplete,
}: {
	index: number;
	checked: boolean;
	hasToggled: boolean;
	onComplete?: () => void;
}) {
	const t = index / (CIRCLE_COUNT - 1);

	const uncheckedX = t * TOTAL_SPREAD;
	const checkedX = (1 - t) * TOTAL_SPREAD;

	const uncheckedHue =
		UNCHECKED_HUE.start + (UNCHECKED_HUE.end - UNCHECKED_HUE.start) * t;
	const checkedHue =
		CHECKED_HUE.start + (CHECKED_HUE.end - CHECKED_HUE.start) * t;

	const uncheckedColor = `hsl(${uncheckedHue}, 70%, ${65 + 10 * t}%)`;
	const checkedColor = `hsl(${checkedHue}, 70%, ${65 + 10 * t}%)`;
	const midHue = (uncheckedHue + checkedHue) / 2;
	const midColor = `hsl(${midHue}, 70%, ${65 + 10 * t}%)`;

	const baseStyle = {
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		top: 0,
		opacity: 0.25,
	};

	// Initial static render
	if (!hasToggled) {
		return (
			<motion.div
				className="absolute rounded-full"
				style={{
					...baseStyle,
					left: uncheckedX,
					backgroundColor: uncheckedColor,
				}}
			/>
		);
	}

	// Animate with keyframes: [start, collapsed, end]
	const xKeyframes = checked
		? [uncheckedX, TOTAL_SPREAD, checkedX]
		: [checkedX, 0, uncheckedX];

	const colorKeyframes = checked
		? [uncheckedColor, midColor, checkedColor]
		: [checkedColor, midColor, uncheckedColor];

	return (
		<motion.div
			className="absolute rounded-full"
			animate={{
				left: xKeyframes,
				backgroundColor: colorKeyframes,
			}}
			transition={{
				duration: 1,
				times: [0, 0.5, 1],
				ease: [
					[0.4, 0, 0.2, 1],
					[0.8, 0, 0.2, 1],
				],
			}}
			onAnimationComplete={() => onComplete?.()}
			style={baseStyle}
		/>
	);
}
