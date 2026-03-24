export const STREAMS_DATA = Object.freeze({
  STREAM_KEY: "ride:events",
  GROUP_NAME: "dispatcher",
  CONSUMER_NAME: `worker:${process.pid.toString()}`,
  CHANNEL: "ride_events"
});

export const PORTS = Object.freeze({
  WS_SERVER: process.env.WS_PORT || 4001,
  API_SERVER: process.env.PORT || 3000
});