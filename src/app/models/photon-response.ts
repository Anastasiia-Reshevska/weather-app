export interface PhotonResponse {
  features: Array<{
    properties: {
      osm_id: number;
      osm_type: string;
      name?: string;
      state?: string;
      country?: string;
    };
    geometry: { coordinates: [number, number] };
  }>;
}
