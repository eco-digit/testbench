<template>
  <nav class="navbar has-background-dark" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <span class="navbar-item has-text-white">Eco:Digit Mobile</span>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <a class="button is-inverted" @click="refreshStats">
            <strong>{{ $t('app.nav.refresh') }}</strong>
          </a>
          <a class="button is-inverted" @click="showNewJobModal()">
            <strong>{{ $t('app.nav.new') }}</strong>
          </a>
        </div>
      </div>
    </div>
  </nav>
  <section class="hero">
    <div class="hero-body">
      <div class="columns">
        <div class="column is-half">
          <ObjectTablePrinter :title="$t('app.panels.title.redis')" :object="redisInfos" :is-list="false"/>
        </div>
        <div class="column is-half">
          <article class="message">
            <div class="message-header">
              <p>{{ $t('app.panels.devices.title') }}</p>
            </div>
            <div class="message-body">
              <p v-if="((! deviceInfos) || deviceInfos.length < 1)">
                {{ $t('app.panels.devices.empty') }}
              </p>
              <ul v-else>
                <li v-for="device in deviceInfos" :key="device.udid">{{device.udid}}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
      <div class="columns">
        <div class="column is-half">
          <ObjectTablePrinter :title="$t('app.panels.title.queue') + ' - ' + $t('app.panels.title.jobs.ui-tests')"
                              :object="uiTestQueueInfos"
                              :is-list="false"/>
        </div>
        <div class="column is-half">
          <ObjectTablePrinter :title="$t('app.panels.title.queue') + ' - ' + $t('app.panels.title.jobs.analyzer')"
                              :object="analyzerQueueInfos"
                              :is-list="false"/>
        </div>
      </div>
      <ObjectTablePrinter :title="$t('app.panels.title.jobs.status')" :object="statusJobs" :is-list="true"/>
      <ObjectTablePrinter :title="$t('app.panels.title.jobs.analyzer')" :object="analyzerJobs" :is-list="true"/>
      <ObjectTablePrinter :title="$t('app.panels.title.jobs.ui-tests')" :object="uiTestJobs" :is-list="true"/>
    </div>
  </section>
  <NewJobModal @new-job-saved="() => refreshStats()" ref="newJobModalRef"></NewJobModal>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import ObjectTablePrinter from "@/components/ObjectTablePrinter.vue";
import NewJobModal from "@/components/NewJobModal.vue";

const apiPrefix = process.env.VUE_APP_API_URL || '';
const newJobModalRef = ref<InstanceType<typeof NewJobModal>>();
const uiTestQueueInfos = ref();
const uiTestJobs = ref();
const statusJobs = ref();
const analyzerQueueInfos = ref();
const analyzerJobs = ref();
const redisInfos = ref();
const deviceInfos = ref();

async function refreshStats() {
  let res = await fetch(`${apiPrefix}/api/info`).then(r => r.json());
  uiTestQueueInfos.value = res.uiTestsJobsQueueInfo?.counts || {};
  analyzerQueueInfos.value = res.analyzerJobsQueueInfo?.counts || {};
  // eslint-disable-next-line
  uiTestJobs.value = (res.uiTestsJobsQueueInfo?.jobs || []).map(function (j: any) {
    return {
      "id": j.id,
      "name": j.name,
      "timestamp": new Date(j.timestamp),
      "progress": j.progress,
      "data": j.data,
      "returnValue": j.returnValue,
      "failed": j.isFailed
    }
  });
  // eslint-disable-next-line
  analyzerJobs.value = (res.analyzerJobsQueueInfo?.jobs || []).map(function (j: any) {
    return {
      "id": j.id,
      "name": j.name,
      "timestamp": new Date(j.timestamp),
      "data": j.data,
      "returnValue": j.returnValue,
      "failed": j.isFailed
    }
  });
  statusJobs.value = (res.statusJobsQueueInfo?.jobs || []).map(function (j: any) {
    return {
      "id": j.id,
      "timestamp": new Date(j.timestamp),
      "data": j.data,
    }
  });
  redisInfos.value = res.redisInfos || {};
  deviceInfos.value = res.devices || []
}

function showNewJobModal() {
  let availableDevices = ((deviceInfos.value || []) as {udid: string}[]).map(d => d.udid)
  // eslint-disable-next-line
  newJobModalRef.value!.showModal(availableDevices)
}

onMounted(() => {
  refreshStats();
})
</script>

<style>
</style>
