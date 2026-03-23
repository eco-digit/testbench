const {remote} = require('webdriverio');
const {webDriverConfig} = require("./appiumConfig");

async function runSingleCoreCPUStressTest() {
    const driver = await remote(webDriverConfig);
    try {
        const benchmarkChooserNavigatorButton = await driver.$('//*[@text="Single-Core-CPU-Stress"]');
        await benchmarkChooserNavigatorButton.click();


        const statusTextElement = await driver.$('//*[@text="not started"]');

        const stratBenchmarkButton = await driver.$('//*[@text="Start Benchmark"]');
        await stratBenchmarkButton.click();

        await driver.waitUntil(async function () {
            return (await statusTextElement.getText()) === 'test finished'
        }, {
            timeout: 1000000,
            timeoutMsg: 'expected text to be different after 1000s'
        })


    } finally {
        await driver.pause(1000);
        await driver.deleteSession();
    }
}

runSingleCoreCPUStressTest();
