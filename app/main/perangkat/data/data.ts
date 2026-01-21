import {
  CheckCircle,
  Clock,
  XCircle,
  Ban,
} from "lucide-react";

export const deviceStatusOptions = [
  {
    label: "Menunggu",
    value: "pending",
    icon: Clock,
  },
  {
    label: "Disetujui",
    value: "approved",
    icon: CheckCircle,
  },
  {
    label: "Ditolak",
    value: "rejected",
    icon: XCircle,
  },
  {
    label: "Dicabut",
    value: "revoked",
    icon: Ban,
  },
];
