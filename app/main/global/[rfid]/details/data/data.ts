// app/main/tasks/data/data.ts
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Sprout,
  Leaf,
  BadgeCheck,
  PawPrint,
  Mars,
  Venus,
} from "lucide-react";

export const weightStatuses = [
  {
    label: "Weight Loss",
    value: "bad",
    icon: ArrowDown,
  },
  {
    label: "Stable Weight",
    value: "neutral",
    icon: ArrowRight,
  },
  {
    label: "Weight Gain",
    value: "good",
    icon: ArrowUp,
  },
];

export const speciesOptions = [
  {
    label: "Cow",
    value: "Cow",
    icon: PawPrint,
  },
  {
    label: "Buffalo",
    value: "Buffalo",
    icon: PawPrint,
  },
  {
    label: "Goat",
    value: "Goat",
    icon: PawPrint,
  },
  {
    label: "Sheep",
    value: "Sheep",
    icon: PawPrint,
  },
  {
    label: "Pig",
    value: "Pig",
    icon: PawPrint,
  },
];

export const sexOptions = [
  {
    label: "Male",
    value: "Male",
    icon: Mars,
  },
  {
    label: "Female",
    value: "Female",
    icon: Venus,
  },
];

export const lifeStageOptions = [
  {
    label: "Baby (0–6 months)",
    value: "baby",
    icon: Sprout,
  },
  {
    label: "Young (>6 months – 1.5 years)",
    value: "young",
    icon: Leaf,
  },
  {
    label: "Adult (>1.5 years)",
    value: "adult",
    icon: BadgeCheck,
  },
];
