import {parse as parseRedisInfo, RedisInfo} from 'redis-info';
import {Queue} from "bullmq";

interface RedisInfos {
    version: string;
    mode: RedisInfo['redis_mode'];
    port: number;
    os: string;
    uptime: number;
    memory: {
        total: number;
        used: number;
        fragmentationRatio: number;
        peak: number;
    };
    clients: {
        connected: number;
        blocked: number;
    };
}


export default async function getRedisInfos(queue: Queue): Promise<RedisInfos> {
    const redisInfoRaw = await queue.client.then(c => c.info ());
    const redisInfo = parseRedisInfo(redisInfoRaw);

    return {
        version: redisInfo.redis_version,
        mode: redisInfo.redis_mode,
        port: +redisInfo.tcp_port,
        os: redisInfo.os,
        uptime: +redisInfo.uptime_in_seconds,
        memory: {
            total: +redisInfo.total_system_memory || +redisInfo.maxmemory,
            used: +redisInfo.used_memory,
            fragmentationRatio: +redisInfo.mem_fragmentation_ratio,
            peak: +redisInfo.used_memory_peak,
        },
        clients: {
            connected: +redisInfo.connected_clients,
            blocked: +redisInfo.blocked_clients,
        },
    };
}

