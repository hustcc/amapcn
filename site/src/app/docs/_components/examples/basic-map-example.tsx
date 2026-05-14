import { Map } from "amapcn";

export function BasicMapExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[116.397428, 39.90923]} zoom={12} />
    </div>
  );
}
