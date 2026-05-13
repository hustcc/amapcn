import fs from "fs";
import path from "path";

const BLOCKS_DIR = path.join(process.cwd(), "src/registry/blocks");

export interface BlockMeta {
  name: string;
  title: string;
  description: string;
  sourceFile: string;
  height?: string;
}

export const blocks: BlockMeta[] = [
  {
    name: "analytics-dashboard",
    title: "Analytics Dashboard",
    description:
      "A map-centric analytics dashboard with city markers, real-time stats, and activity indicators.",
    sourceFile: "analytics-dashboard.tsx",
    height: "520px",
  },
  {
    name: "delivery-tracker",
    title: "Delivery Tracker",
    description:
      "Track deliveries in real-time with a split-panel layout showing order details and route progress on the map.",
    sourceFile: "delivery-tracker.tsx",
    height: "520px",
  },
  {
    name: "logistics-network",
    title: "Logistics Network",
    description:
      "Visualize a logistics network with hub statistics, route lines, and cargo flow between distribution centers.",
    sourceFile: "logistics-network.tsx",
    height: "520px",
  },
];

export function getBlockSource(filename: string): string {
  const filePath = path.join(BLOCKS_DIR, filename);
  const source = fs.readFileSync(filePath, "utf-8");
  return source.replace(/@\/registry\/map/g, "@/components/ui/map");
}