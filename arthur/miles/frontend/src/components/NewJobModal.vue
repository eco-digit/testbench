<template>
  <div class="modal" :class="isVisible ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{$t('app.modals.new-job.title')}}</p>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">{{$t('app.modals.new-job.body.fields.title.name')}}</label>
          <div class="control">
            <input class="input" placeholder="Text" v-model="name" required/>
          </div>
        </div>
        <div class="field">
          <label class="label">{{$t('app.modals.new-job.body.fields.title.device')}}</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="selectedDevice" required>
                <template v-if="devices && devices.length > 0">
                  <option v-for="device of devices" :key="device" :value="device" >{{device}}</option>
                </template>
                <option v-else disabled>{{$t('app.modals.new-job.body.fields.device.empty')}}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">{{$t('app.modals.new-job.body.fields.title.measurement-data-tar')}}</label>
          <div class="control">
            <input class="input" type="file" ref="measurement-data-file-chooser" accept=".tar" required/>
          </div>
        </div>
        <div class="field is-grouped">
          <label class="label">{{$t('app.modals.new-job.body.fields.title.environmental-variables')}}</label>
          <p class="control">
            <button class="button is-primary" @click="envStrings.push('')">
              +
            </button>
          </p>
        </div>
        <div class="field has-addons" v-for="(_, index) of envStrings" :key="index">
          <div class="control is-expanded">
            <input class="input" type="text" placeholder="Variable=Value" v-model="envStrings[index]">
          </div>
          <div class="control">
            <button class="button is-danger" @click="envStrings.splice(index, 1)">
              X
            </button>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-end">
        <div class="buttons">
          <button class="button is-inverted" @click="close">{{$t('app.modals.new-job.buttons.cancel')}}</button>
          <button class="button is-inverted" @click="save">{{$t('app.modals.new-job.buttons.save')}}</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {ref, useTemplateRef} from "vue";

  const emit = defineEmits(['newJobSaved'])

  const LOCAL_STORAGE_KEY = "EcoDigitMobile:NewJobModalProperties";
  const isVisible = ref(false)
  const name = ref('');
  const measurementFileChooserRef = useTemplateRef('measurement-data-file-chooser');
  const devices = ref([] as string[])
  const selectedDevice = ref('')
  const envStrings = ref([] as string[])

  function showModal(availableDevices: string[]) {
    let savedModalProperties = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || JSON.stringify({"testImage": ""}));
    devices.value = availableDevices;
    selectedDevice.value = '';
    if(devices.value.length == 1){
      selectedDevice.value = availableDevices[0];
    }
    isVisible.value = true;
  }
  function close() {
    isVisible.value = false;
    name.value = '';
    envStrings.value = [];
  }

  async function save() {
    const apiPrefix = process.env.VUE_APP_API_URL || '';

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("device", selectedDevice.value);
    for (const envString of envStrings.value) {
      formData.append("config[env][]", envString);
    }
    if(envStrings.value.length < 1){
      formData.append("config[env][]", "");
    }
    // eslint-disable-next-line
    formData.append("measurement_data", measurementFileChooserRef.value!.files![0]);

    let resp = await fetch(`${apiPrefix}/api/add`, {
      method: "POST",
      body: formData,
    });
    if(resp.ok) {
      emit('newJobSaved')
      close();
    }
  }

  defineExpose({
    showModal
  });


</script>



<style scoped>

</style>
