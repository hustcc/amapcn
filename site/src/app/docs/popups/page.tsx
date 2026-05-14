import { DocsLayout, DocsSection, DocsCode } from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { StandalonePopupExample } from "../_components/examples/standalone-popup-example";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popups",
};

export default function PopupsPage() {
  const popupSource = getExampleSource("standalone-popup-example.tsx");

  return (
    <DocsLayout
      title="Standalone Popups"
      description="Display popups anywhere on the map without markers."
      prev={{ title: "Markers", href: "/docs/markers" }}
      next={{ title: "Routes", href: "/docs/routes" }}
    >
      <DocsSection>
        <p>
          Use <DocsCode>MapPopup</DocsCode> to display a popup at any location
          on the map. Unlike <DocsCode>MarkerPopup</DocsCode>, standalone popups
          are not attached to markers and can be controlled programmatically.
        </p>
      </DocsSection>

      <ComponentPreview code={popupSource}>
        <StandalonePopupExample />
      </ComponentPreview>
    </DocsLayout>
  );
}
