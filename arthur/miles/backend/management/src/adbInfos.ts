import {ADB} from "appium-adb";

const HEADLESS_EMULATOR_AVAILABLE = (process.env.HEADLESS_EMULATOR_AVAILABLE || false) == "true";

export default async function getADBDeviceInfos() {
    let devicesAccordingToAdb = [];
    if(HEADLESS_EMULATOR_AVAILABLE){
        devicesAccordingToAdb.push({udid: "HEADLESS_EMULATOR", state: "device"})
    } else {
        try{
            const adb = await ADB.createADB();
            devicesAccordingToAdb.push(...await adb.getConnectedDevices());
        } catch (e){
            console.error("Nicht möglich, die aktuellen ADB-Devices abzufragen. Folgender Fehler:")
            console.error(e);
        }
    }
    return devicesAccordingToAdb;
}
