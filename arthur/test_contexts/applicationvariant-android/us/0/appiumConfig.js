/**
 * Diese Datei kann genutzt werden, um die Einstellungen für die eigenen Appium-Tests zu laden.
 * Bei der Ausführung des Containers in der Testplattform wird diese Datei hier mit Werten überschrieben, die passend für die Testplattform sind.
 */
export const webDriverConfig = {
    hostname: 'localhost',
    port: 4723,
    logLevel: 'info',
    capabilities: {
        platformName: 'Android',
        'appium:host': "localhost",
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android',
        'appium:autoLaunch': 'false',
    }
}
