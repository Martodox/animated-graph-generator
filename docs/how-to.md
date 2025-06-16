# How to create your own video

This tutorial wil take you through all the steps needed to create a video like the one linked in the [youtube-samples](/youtube-samples) section

## Hardware requirements

1. A video camera
2. HR measurment device with 1s resolution

The sample videos have been recorded using GoPro Hero 7 Black and DJI Action 5 Pro cameras and HR has been measured using [Polar H10 chest strap](https://www.polar.com/en/sensors/h10-heart-rate-sensor)

**Polar H10 is as good as it gets and is recommended for the most accurate measurments** But you can also use data from a Garmin heart rate strap. And you can record video with any video recording device.

If you wonder why the HR readings from an optical sensor on your watch are not good enough, check out [The Quantified Scientist](https://www.youtube.com/@TheQuantifiedScientist/videos) youtube channel for more information.

**You can also display on graph oxygen saturation of blood using data from an oxiwear device** get in touch if you want to know how. [Example here.](https://youtu.be/PYYcvbbUBhg)

## Preparing the required files

The script only requires the heart rate data and later you will merge the video overlay onto your video in a video editor eg. the free version of Davinci Resolve.

#### Recording video

When recording the video it is recommended at the beginning of the recording session to record the time on your device logging heart rate (watch or phone)
with your camera so then you can later fill out the required time difference in the script config file.

#### Export HRM data

After the recording session download the heart rate data from either:

- [Garmin Connect](https://connect.garmin.com/) - in activity select "export file" and unzip to get .fit file.
- or [Polar Flow](https://flow.polar.com/) - in activity select "Export" "session csv".

## Downloading, cloning or forking this app

If you are not familiar with getting code from github [this page](https://docs.github.com/en/get-started/start-your-journey/downloading-files-from-github) might help.

## Running the app

#### src/config.sample.ts

In order to provide settings to the app you copy `src/config.sample.ts` to `src/config.ts` and then edit `src/config.ts`.

You will find comments in `src/config.sample.ts` explaining the different parameters that can be edited. 

#### then

In a terminal window go to the root directory of the animated graph generator and enter:

```
npm start
```

You should see an animation in the terminal showing you progress.

## Merge the created overlay onto recorded video

The overlay video sections should be merged on top of the recorded video or clips of the video. The overlay video should be positioned to start at the `startTime` time stamp you provided to the script in the config file.

## Work In Progress
