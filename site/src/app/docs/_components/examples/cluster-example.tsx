"use client";

import { useState } from "react";
import { Map, MapClusterLayer, MapPopup, MapControls } from "amapcn";

interface CityProperties {
  name: string;
  province: string;
  population: number;
  [key: string]: unknown;
}

// Hardcoded Chinese cities dataset
const chineseCitiesData: GeoJSON.FeatureCollection<GeoJSON.Point, CityProperties> = {
  type: "FeatureCollection",
  features: [
    // Beijing cluster
    { type: "Feature", properties: { name: "Beijing", province: "Beijing", population: 215 }, geometry: { type: "Point", coordinates: [116.397428, 39.90923] } },
    { type: "Feature", properties: { name: "Chaoyang", province: "Beijing", population: 35 }, geometry: { type: "Point", coordinates: [116.4860, 39.9221] } },
    { type: "Feature", properties: { name: "Haidian", province: "Beijing", population: 33 }, geometry: { type: "Point", coordinates: [116.2977, 40.0497] } },
    { type: "Feature", properties: { name: "Fengtai", province: "Beijing", population: 22 }, geometry: { type: "Point", coordinates: [116.2867, 39.8585] } },
    { type: "Feature", properties: { name: "Shunyi", province: "Beijing", population: 11 }, geometry: { type: "Point", coordinates: [116.6540, 40.1302] } },
    // Shanghai cluster
    { type: "Feature", properties: { name: "Shanghai", province: "Shanghai", population: 247 }, geometry: { type: "Point", coordinates: [121.4737, 31.2304] } },
    { type: "Feature", properties: { name: "Pudong", province: "Shanghai", population: 56 }, geometry: { type: "Point", coordinates: [121.5440, 31.2218] } },
    { type: "Feature", properties: { name: "Minhang", province: "Shanghai", population: 26 }, geometry: { type: "Point", coordinates: [121.3814, 31.1128] } },
    { type: "Feature", properties: { name: "Baoshan", province: "Shanghai", population: 20 }, geometry: { type: "Point", coordinates: [121.4890, 31.4050] } },
    { type: "Feature", properties: { name: "Jiading", province: "Shanghai", population: 18 }, geometry: { type: "Point", coordinates: [121.2654, 31.3750] } },
    // Guangzhou cluster
    { type: "Feature", properties: { name: "Guangzhou", province: "Guangdong", population: 186 }, geometry: { type: "Point", coordinates: [113.2644, 23.1291] } },
    { type: "Feature", properties: { name: "Tianhe", province: "Guangdong", population: 18 }, geometry: { type: "Point", coordinates: [113.3620, 23.1293] } },
    { type: "Feature", properties: { name: "Yuexiu", province: "Guangdong", population: 10 }, geometry: { type: "Point", coordinates: [113.2612, 23.1409] } },
    // Shenzhen cluster
    { type: "Feature", properties: { name: "Shenzhen", province: "Guangdong", population: 175 }, geometry: { type: "Point", coordinates: [114.0579, 22.5431] } },
    { type: "Feature", properties: { name: "Nanshan", province: "Guangdong", population: 17 }, geometry: { type: "Point", coordinates: [113.9230, 22.5276] } },
    { type: "Feature", properties: { name: "Futian", province: "Guangdong", population: 16 }, geometry: { type: "Point", coordinates: [114.0540, 22.5219] } },
    // Chengdu cluster
    { type: "Feature", properties: { name: "Chengdu", province: "Sichuan", population: 209 }, geometry: { type: "Point", coordinates: [104.0668, 30.5728] } },
    { type: "Feature", properties: { name: "Chenghua", province: "Sichuan", population: 7 }, geometry: { type: "Point", coordinates: [104.1010, 30.5954] } },
    { type: "Feature", properties: { name: "Wuhou", province: "Sichuan", population: 7 }, geometry: { type: "Point", coordinates: [104.0430, 30.5630] } },
    // Wuhan cluster
    { type: "Feature", properties: { name: "Wuhan", province: "Hubei", population: 123 }, geometry: { type: "Point", coordinates: [114.3054, 30.5931] } },
    { type: "Feature", properties: { name: "Wuchang", province: "Hubei", population: 12 }, geometry: { type: "Point", coordinates: [114.3142, 30.5546] } },
    { type: "Feature", properties: { name: "Hankou", province: "Hubei", population: 11 }, geometry: { type: "Point", coordinates: [114.2830, 30.6200] } },
    // Hangzhou
    { type: "Feature", properties: { name: "Hangzhou", province: "Zhejiang", population: 123 }, geometry: { type: "Point", coordinates: [120.1536, 30.2741] } },
    { type: "Feature", properties: { name: "Xihu", province: "Zhejiang", population: 10 }, geometry: { type: "Point", coordinates: [120.1030, 30.2590] } },
    // Nanjing
    { type: "Feature", properties: { name: "Nanjing", province: "Jiangsu", population: 93 }, geometry: { type: "Point", coordinates: [118.7969, 32.0603] } },
    { type: "Feature", properties: { name: "Xuanwu", province: "Jiangsu", population: 9 }, geometry: { type: "Point", coordinates: [118.7977, 32.0678] } },
    // Xi'an
    { type: "Feature", properties: { name: "Xi'an", province: "Shaanxi", population: 129 }, geometry: { type: "Point", coordinates: [108.9402, 34.3416] } },
    { type: "Feature", properties: { name: "Weiyang", province: "Shaanxi", population: 10 }, geometry: { type: "Point", coordinates: [108.9510, 34.3805] } },
    // Tianjin
    { type: "Feature", properties: { name: "Tianjin", province: "Tianjin", population: 137 }, geometry: { type: "Point", coordinates: [117.1901, 39.1256] } },
    { type: "Feature", properties: { name: "Binhai", province: "Tianjin", population: 13 }, geometry: { type: "Point", coordinates: [117.7140, 39.0170] } },
    // Chongqing
    { type: "Feature", properties: { name: "Chongqing", province: "Chongqing", population: 320 }, geometry: { type: "Point", coordinates: [106.5516, 29.5630] } },
    { type: "Feature", properties: { name: "Jiangbei", province: "Chongqing", population: 14 }, geometry: { type: "Point", coordinates: [106.5740, 29.6060] } },
    // Suzhou
    { type: "Feature", properties: { name: "Suzhou", province: "Jiangsu", population: 107 }, geometry: { type: "Point", coordinates: [120.5853, 31.2989] } },
    { type: "Feature", properties: { name: "Gusu", province: "Jiangsu", population: 9 }, geometry: { type: "Point", coordinates: [120.6100, 31.3060] } },
    // More cities
    { type: "Feature", properties: { name: "Zhengzhou", province: "Henan", population: 127 }, geometry: { type: "Point", coordinates: [113.6254, 34.7466] } },
    { type: "Feature", properties: { name: "Qingdao", province: "Shandong", population: 92 }, geometry: { type: "Point", coordinates: [120.3826, 36.0671] } },
    { type: "Feature", properties: { name: "Jinan", province: "Shandong", population: 90 }, geometry: { type: "Point", coordinates: [117.0009, 36.6758] } },
    { type: "Feature", properties: { name: "Harbin", province: "Heilongjiang", population: 99 }, geometry: { type: "Point", coordinates: [126.5358, 45.8038] } },
    { type: "Feature", properties: { name: "Shenyang", province: "Liaoning", population: 83 }, geometry: { type: "Point", coordinates: [123.4315, 41.8057] } },
    { type: "Feature", properties: { name: "Changsha", province: "Hunan", population: 100 }, geometry: { type: "Point", coordinates: [112.9388, 28.2278] } },
    { type: "Feature", properties: { name: "Kunming", province: "Yunnan", population: 84 }, geometry: { type: "Point", coordinates: [102.8329, 24.8801] } },
    { type: "Feature", properties: { name: "Fuzhou", province: "Fujian", population: 84 }, geometry: { type: "Point", coordinates: [119.2965, 26.0745] } },
    { type: "Feature", properties: { name: "Xiamen", province: "Fujian", population: 52 }, geometry: { type: "Point", coordinates: [118.0894, 24.4798] } },
    { type: "Feature", properties: { name: "Hefei", province: "Anhui", population: 94 }, geometry: { type: "Point", coordinates: [117.2272, 31.8206] } },
    { type: "Feature", properties: { name: "Nanchang", province: "Jiangxi", population: 63 }, geometry: { type: "Point", coordinates: [115.8582, 28.6820] } },
    { type: "Feature", properties: { name: "Lanzhou", province: "Gansu", population: 43 }, geometry: { type: "Point", coordinates: [103.8343, 36.0611] } },
    { type: "Feature", properties: { name: "Urumqi", province: "Xinjiang", population: 40 }, geometry: { type: "Point", coordinates: [87.6177, 43.7928] } },
    { type: "Feature", properties: { name: "Lhasa", province: "Tibet", population: 9 }, geometry: { type: "Point", coordinates: [91.1409, 29.6473] } },
    { type: "Feature", properties: { name: "Guiyang", province: "Guizhou", population: 60 }, geometry: { type: "Point", coordinates: [106.7071, 26.5982] } },
    { type: "Feature", properties: { name: "Nanning", province: "Guangxi", population: 87 }, geometry: { type: "Point", coordinates: [108.3667, 22.8170] } },
  ],
};

export default function ClusterExample() {
  const [selectedPoint, setSelectedPoint] = useState<{
    coordinates: [number, number];
    properties: CityProperties;
  } | null>(null);

  return (
    <div className="h-[400px] w-full">
      <Map center={[113.0, 35.0]} zoom={4}>
        <MapClusterLayer<CityProperties>
          data={chineseCitiesData}
          clusterColors={["#22c55e", "#eab308", "#ef4444"]}
          pointColor="#3b82f6"
          onPointClick={(feature, coordinates) => {
            setSelectedPoint({
              coordinates,
              properties: feature.properties,
            });
          }}
        />

        {selectedPoint && (
          <MapPopup
            key={`${selectedPoint.coordinates[0]}-${selectedPoint.coordinates[1]}`}
            longitude={selectedPoint.coordinates[0]}
            latitude={selectedPoint.coordinates[1]}
            onClose={() => setSelectedPoint(null)}
            closeButton
          >
            <div className="space-y-1 p-1">
              <p className="font-medium text-sm">{selectedPoint.properties.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedPoint.properties.province}
              </p>
              <p className="text-xs text-muted-foreground">
                Pop: {selectedPoint.properties.population}万
              </p>
            </div>
          </MapPopup>
        )}

        <MapControls />
      </Map>
    </div>
  );
}
