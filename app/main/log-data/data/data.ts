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

/**
 * Status perubahan berat badan ternak
 */
export const weightStatuses = [
  {
    label: "Berat Turun",
    value: "bad",
    icon: ArrowDown,
  },
  {
    label: "Berat Stabil",
    value: "neutral",
    icon: ArrowRight,
  },
  {
    label: "Berat Naik",
    value: "good",
    icon: ArrowUp,
  },
];

/**
 * Jenis ternak
 */
export const speciesOptions = [
  {
    label: "Sapi",
    value: "Cow",
    icon: PawPrint,
  },
  {
    label: "Kerbau",
    value: "Buffalo",
    icon: PawPrint,
  },
  {
    label: "Kambing",
    value: "Goat",
    icon: PawPrint,
  },
  {
    label: "Domba",
    value: "Sheep",
    icon: PawPrint,
  },
  {
    label: "Babi",
    value: "Pig",
    icon: PawPrint,
  },
];

/**
 * Jenis kelamin ternak
 */
export const sexOptions = [
  {
    label: "Jantan",
    value: "Male",
    icon: Mars,
  },
  {
    label: "Betina",
    value: "Female",
    icon: Venus,
  },
];

/**
 * Tahap umur ternak
 */
export const lifeStageOptions = [
  {
    label: "Bayi (0–6 bulan)",
    value: "baby",
    icon: Sprout,
  },
  {
    label: "Remaja (>6 bulan – 1,5 tahun)",
    value: "young",
    icon: Leaf,
  },
  {
    label: "Dewasa (>1,5 tahun)",
    value: "adult",
    icon: BadgeCheck,
  },
];