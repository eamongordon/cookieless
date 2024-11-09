const iconNameMap: Record<string, string> = {
    "Samsung Internet": 'samsung_internet',
    "Chrome": 'chrome',
    "Chrome WebView": 'chrome',
    "Chrome Headless": 'chrome',
    "Firefox": 'firefox',
    "Opera [GX/Mini/Mobi/Tablet]": 'opera',
    "Opera Coast": 'opera',
    "Edge": 'edge',
    "Safari": 'safari',
    "Mobile Safari": 'safari',
    "Chromium": 'chromium',
    "Android[-x86]": 'android',
    "Windows [Phone/Mobile]": 'windows',
    "Mac OS": 'apple',
    "iOS": 'apple',
    "watchOS": 'apple',
    "Linux": 'linux',
    "PCLinuxOS": 'linux',
    "VectorLinux": 'linux',
    "Ubuntu": 'ubuntu'
};

export type ValidIcon = keyof typeof iconNameMap;

export const getIconKey = (name: ValidIcon) => {
    return iconNameMap[name];
};

export const isValidIcon = (value: string): value is ValidIcon => {
    return value in iconNameMap;
};