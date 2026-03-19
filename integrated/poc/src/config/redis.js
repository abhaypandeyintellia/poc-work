import { createClient } from 'redis';

export let redis;
export let pub;
export let sub;

export async function connectRedis() {
    if (!redis || !pub || !sub) {
        const redisOptions = process.env.REDIS_URL
            ? {
                url: process.env.REDIS_URL,
            }
            : {};

        redis = createClient(redisOptions);
        pub = createClient(redisOptions);
        sub = createClient(redisOptions);

        redis.on('error', (err) => console.error('Redis Error', err));
        pub.on('error', (err) => console.error('Pub Error', err));
        sub.on('error', (err) => console.error('Sub Error', err));
    }

    await redis.connect();
    await pub.connect();
    await sub.connect();

    console.log("Connected to redis");

}
