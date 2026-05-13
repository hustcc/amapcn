import { highlightCode } from "@/lib/highlight";
import { type BlockMeta } from "@/lib/blocks";
import { BlockPreviewClient } from "./block-preview-client";

interface BlockDisplayProps {
  block: BlockMeta;
  source: string;
  children: React.ReactNode;
}

export async function BlockDisplay({ block, source, children }: BlockDisplayProps) {
  const highlightedCode = await highlightCode(source, "tsx");

  return (
    <section id={block.name} className="scroll-mt-20">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{block.title}</h2>
        <p className="text-muted-foreground text-sm">{block.description}</p>
      </div>
      <BlockPreviewClient
        blockName={block.name}
        source={source}
        highlightedCode={highlightedCode}
        height={block.height}
      >
        {children}
      </BlockPreviewClient>
    </section>
  );
}