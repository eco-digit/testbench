import {Job, JobState, Queue} from "bullmq";
import {JobType} from "bullmq/dist/esm/types/job-type";

export const formatJob = (job: Job) => {
    const jobProps = job.toJSON();

    const stacktrace = jobProps.stacktrace ? jobProps.stacktrace.filter(Boolean) : [];
    stacktrace.reverse();

    return {
        id: jobProps.id,
        timestamp: jobProps.timestamp,
        processedOn: jobProps.processedOn,
        processedBy: jobProps.processedBy,
        finishedOn: jobProps.finishedOn,
        progress: jobProps.progress,
        attempts: jobProps.attemptsMade,
        delay: jobProps.delay,
        failedReason: jobProps.failedReason,
        stacktrace,
        opts: jobProps.opts,
        data: jobProps.data,
        name: jobProps.name,
        returnValue: jobProps.returnvalue,
        isFailed: !!jobProps.failedReason || (Array.isArray(stacktrace) && stacktrace.length > 0),
    };
};


function getPagination(
    statuses: JobType[],
    counts: Record<JobState, number>,
    currentPage: number,
    jobsPerPage: number
) {
    const isLatestStatus = statuses.length > 1;
    const total = isLatestStatus
        ? statuses.reduce((total, status) => total + Math.min(counts[status], jobsPerPage), 0)
        : counts[statuses[0]];

    const start = isLatestStatus ? 0 : (currentPage - 1) * jobsPerPage;
    const pageCount = isLatestStatus ? 1 : Math.ceil(total / jobsPerPage);

    return {
        pageCount,
        range: {start, end: start + jobsPerPage - 1},
    };
}

const allJobTypes: JobType[] = [
    'active',
    'waiting',
    'waiting-children',
    'prioritized',
    'completed',
    'failed',
    'delayed',
    'paused',
    'repeat',
    'wait'
];

export async function getQueueInfos(queue: Queue, query: Record<string, any>) {
    const jobsPerPage = +query.jobsPerPage || 10;
    const status = (!query.status || query.status === 'latest') ? allJobTypes : [query.status as JobState];
    const currentPage = +query.page || 1;

    const counts = await queue.getJobCounts() as unknown as Record<JobState, number>;

    const pagination = getPagination(status, counts, currentPage, jobsPerPage);
    const jobs = await queue.getJobs(status, pagination.range.start, pagination.range.end);

    return {
        name: queue.name,
        counts: counts as Record<JobType, number>,
        jobs: jobs.filter(Boolean).map((job) => formatJob(job)),
        pagination,
    }
}
