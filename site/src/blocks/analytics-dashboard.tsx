"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "amapcn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, Users, Activity, MapPin } from "lucide-react";

const analyticsData = [
  { lng: 116.397428, lat: 39.90923, city: "北京", users: 2847, growth: 12.5 },
  { lng: 121.4737, lat: 31.2304, city: "上海", users: 2134, growth: 8.3 },
  { lng: 113.2644, lat: 23.1291, city: "广州", users: 1567, growth: 15.2 },
  { lng: 114.0579, lat: 22.5431, city: "深圳", users: 1298, growth: 22.1 },
  { lng: 104.0668, lat: 30.5728, city: "成都", users: 987, growth: 6.7 },
  { lng: 120.1536, lat: 30.2741, city: "杭州", users: 876, growth: 18.9 },
  { lng: 114.3054, lat: 30.5931, city: "武汉", users: 654, growth: 9.4 },
  { lng: 118.7969, lat: 32.0603, city: "南京", users: 543, growth: 5.2 },
  { lng: 108.9402, lat: 34.3416, city: "西安", users: 432, growth: 11.8 },
  { lng: 117.1901, lat: 39.1256, city: "天津", users: 321, growth: 3.6 },
];

const hourlyActivity = [42, 58, 35, 67, 82, 91, 73, 88, 95, 78, 64, 52];

const maxUsers = Math.max(...analyticsData.map((d) => d.users));
const maxActivity = Math.max(...hourlyActivity);

export function AnalyticsDashboard() {
  return (
    <div className="relative h-full w-full">
      <Map center={[108.0, 34.0]} zoom={4}>
        <MapControls showZoom position="bottom-right" />
        {analyticsData.map((loc) => (
          <MapMarker key={loc.city} longitude={loc.lng} latitude={loc.lat}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute rounded-full bg-blue-500/20"
                  style={{
                    width: Math.max(12, (loc.users / maxUsers) * 40),
                    height: Math.max(12, (loc.users / maxUsers) * 40),
                  }}
                />
                <div
                  className="relative rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                  style={{
                    width: Math.max(6, (loc.users / maxUsers) * 16),
                    height: Math.max(6, (loc.users / maxUsers) * 16),
                  }}
                />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <div className="text-center text-xs">
                <div className="font-medium">{loc.city}</div>
                <div className="text-blue-500 font-semibold">
                  {loc.users.toLocaleString()}
                </div>
                <div className="text-muted-foreground">active users</div>
              </div>
            </MarkerTooltip>
          </MapMarker>
        ))}
      </Map>

      {/* Active Users Card */}
      <Card className="absolute top-3 left-3 z-10 w-56 bg-background/95 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10">
              <Users className="size-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Active Users
              </p>
              <p className="text-xl font-semibold leading-tight">
                {analyticsData
                  .reduce((s, d) => s + d.users, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="size-3 text-emerald-500" />
            <span className="font-medium text-emerald-500">+12.5%</span>
            <span className="text-muted-foreground">vs last hour</span>
          </div>
          <div className="mt-3 flex items-end gap-0.5 h-8">
            {analyticsData.slice(0, 8).map((loc) => (
              <div
                key={loc.city}
                className="flex-1 rounded-t bg-blue-500/70"
                style={{ height: `${(loc.users / maxUsers) * 100}%` }}
                title={`${loc.city}: ${loc.users}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Card */}
      <Card className="absolute top-3 right-3 z-10 w-48 bg-background/95 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10">
              <Activity className="size-3.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Today
              </p>
              <p className="text-xl font-semibold leading-tight">3,847</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end gap-0.5 h-6">
            {hourlyActivity.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-emerald-500/60"
                style={{ height: `${(val / maxActivity) * 100}%` }}
              />
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-[10px]">
            Peak: {Math.max(...hourlyActivity)} sessions/hr
          </p>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-border/50 bg-background/95 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3 text-blue-500" />
            <span className="text-muted-foreground">
              {analyticsData.length} cities
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}