import {
  DocsCode,
  DocsLayout,
  DocsLink,
  DocsNote,
  DocsSection,
} from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Map, MapControls } from "@/registry/map";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://map.ling.pub";

const installCode = `npx shadcn@latest add ${siteUrl}/amap.json`;

const usageCode = `import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";

export function MyMap() {
  return (
    <Card className="h-[300px] p-0 overflow-hidden">
      <Map
        amapKey="YOUR_AMAP_KEY"
        center={[116.397428, 39.90923]}
        zoom={11}
      >
        <MapControls />
      </Map>
    </Card>
  );
}`;

export const metadata: Metadata = {
  title: "Installation",
};

export default function InstallationPage() {
  return (
    <DocsLayout
      title="Installation"
      description="How to install and set up amapcn in your project."
      prev={{ title: "Introduction", href: "/docs" }}
      next={{ title: "API Reference", href: "/docs/api-reference" }}
      toc={[
        { title: "Prerequisites", slug: "prerequisites" },
        { title: "Installation", slug: "installation" },
        { title: "Usage", slug: "usage" },
      ]}
    >
      <DocsSection title="Prerequisites">
        <p>
          A project with{" "}
          <DocsLink href="https://tailwindcss.com" external>
            Tailwind CSS
          </DocsLink>{" "}
          and{" "}
          <DocsLink href="https://ui.shadcn.com" external>
            shadcn/ui
          </DocsLink>{" "}
          set up.
        </p>
      </DocsSection>

      <DocsSection title="Installation">
        <p>Run the following command to add the map component:</p>
        <CodeBlock code={installCode} language="bash" />
        <p>
          This will install <DocsCode>@amap/amap-jsapi-loader</DocsCode> and add the map
          component to your project.
        </p>
      </DocsSection>

      <DocsSection title="Usage">
        <p>Import and use the map component:</p>
        <CodeBlock code={usageCode} />
        <Card className="h-[300px] p-0 overflow-hidden rounded-lg">
          <Map center={[116.397428, 39.90923]} zoom={11}>
            <MapControls />
          </Map>
        </Card>
      </DocsSection>

      <DocsNote>
        <strong>Note:</strong> AMap requires a valid API key. Pass it via the{" "}
        <code>amapKey</code> prop or set the <code>NEXT_PUBLIC_AMAP_KEY</code>{" "}
        environment variable. Get your key at{" "}
        <a href="https://lbs.amap.com/" className="underline" target="_blank" rel="noreferrer">
          lbs.amap.com
        </a>
        . Map styles automatically switch between light and dark themes.
      </DocsNote>
    </DocsLayout>
  );
}
