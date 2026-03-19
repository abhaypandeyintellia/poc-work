import { redis, pub } from '../config/redis.js';

export async function handleDriverLocation(userId, data) {
  const { lat, lng } = data;

  await redis.geoAdd("drivers", {
    longitude: lng,
    latitude: lat,
    member: userId
  });

  await pub.publish("driver_location", JSON.stringify({
    driverId: userId,
    lat,
    lng
  }));
}

export async function handleNearby(ws, data) {
  const { lat, lng } = data;

  const geoResults = await redis.geoSearchWith(
    "drivers",
    { longitude: lng, latitude: lat },
    { radius: 1, unit: "km" },
    ["WITHDIST"]
  );

  const drivers = geoResults.map((item) => ({
    driverId: item.member,
    distanceKm: Number(item.distance)
  }));

  ws.send(JSON.stringify({
    type: "nearby_drivers",
    drivers
  }));
}
