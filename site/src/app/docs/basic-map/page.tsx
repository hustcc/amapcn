import { DocsLayout, DocsSection, DocsCode } from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { BasicMapExample } from "../_components/examples/basic-map-example";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
};

export default function BasicMapPage() {
  const basicMapSource = getExampleSource("basic-map-example.tsx");

  return (
    <DocsLayout
      title="Map"
      description="The simplest way to add an interactive map to your application."
      prev={{ title: "API Reference", href: "/docs/api-reference" }}
      next={{ title: "Controls", href: "/docs/controls" }}
    >
      <DocsSection>
        <p>
          The <DocsCode>Map</DocsCode> component handles AMap JS API setup,
          theming, and provides context for child components.
        </p>
      </DocsSection>

      <ComponentPreview code={basicMapSource}>
        <BasicMapExample />
      </ComponentPreview>
    </DocsLayout>
  );
}
