import { Metadata } from "next";
import { Header } from "@/components/header";
import { blocks, getBlockSource } from "@/lib/blocks";
import { BlocksPageHeader } from "./_components/blocks-page-header";
import { BlockDisplay } from "./_components/block-display";
import { AnalyticsDashboard } from "@/registry/blocks/analytics-dashboard";
import { DeliveryTracker } from "@/registry/blocks/delivery-tracker";
import { LogisticsNetwork } from "@/registry/blocks/logistics-network";

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Pre-built, ready-to-use map blocks built with AMap, Tailwind CSS, and shadcn/ui.",
};

const blockComponents: Record<string, React.ReactNode> = {
  "analytics-dashboard": <AnalyticsDashboard />,
  "delivery-tracker": <DeliveryTracker />,
  "logistics-network": <LogisticsNetwork />,
};

export default function BlocksPage() {
  return (
    <div className="flex flex-col pb-28">
      <Header className="border-b border-transparent" />

      <main className="flex-1">
        <section className="relative w-full py-16">
          <BlocksPageHeader />
        </section>

        <section
          className="container space-y-16 px-6"
          id="blocks"
        >
          {blocks.map((block) => {
            const source = getBlockSource(block.sourceFile);
            return (
              <BlockDisplay key={block.name} block={block} source={source}>
                {blockComponents[block.name]}
              </BlockDisplay>
            );
          })}
        </section>
      </main>
    </div>
  );
}