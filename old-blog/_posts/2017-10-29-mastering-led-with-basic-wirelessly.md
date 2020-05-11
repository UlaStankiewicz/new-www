---
layout: post
title: Mastering LED with BASIC wirelessly
tags: ["BASIC", "esp8266", "esp-12", "LED", "electronics"]
comments: true
author: pawel
---

As a DIY fan I love to browse internet in search of ideas and inspirations. So I've found a pretty nice project, called [ESPBASIC](https://www.esp8266basic.com/). I heard about BASIC, but I had  never had a chance neither to learn it nor to use it, so I thought it was 's time to meet BASIC (although it's just an interpreter). I have few ESP-12F chips in my drawer, few cables and LEDs scattered around and a free breadboard, and that will be enough for the first encounter with BASIC. My idea is simple and typical for electronics - I have decided to make `hello world` of DIY world - blinking LED.

# Burning chips

There are a few steps:
1. Connect uC to any UART controller (I'm using pl2303)
2. Download a flashing tool from the [official website](https://www.esp8266basic.com/download.html)
3. Select a port and flash firmware

I had only one problem there - drivers. Windows 10 is a bit too strict about drivers, so I had to download old version of my pl2303 driver and everything goes fine. Except that I think it's one of easiest firmwares to install.

# Connecting

On your WiFi AP list should appear one more network called like `ESP AA:BB:CC:DD:EE:FF`. Just connect to it, discover device's IP (it should be `192.168.4.1`) and put it into the browser.
Your eyes should see something like this:

![Screen 1](/images/mastering-led-with-basic-wirelessly/screen1.png){: .center-image}

In `SETTINGS` tab you can configure ESP to connect to your home wifi, setup OTA url (eg. url to BASIC file hosted on GitHub)

# Hello world

ESPBASIC has nearly a plaintext, one-paged documentation:
https://docs.google.com/document/d/1EiYugfu12X2_pmfmu2O19CcLX0ALgLM4r2YxKYyJon8/pub
So I tried to put `Hello World` on my screen with the following code in `[EDIT]` tab:

```
print "Hello World"
```

Then `Save` file and `[RUN]` the code.

![Screen 2](/images/mastering-led-with-basic-wirelessly/screen2.png){: .center-image}

Yeah! It was easy. But if you want to put one more `print`, you will see garbage (`<hr>` tag) above your text. Quickly look into documentation and you should find out there also `wprint` function, that put text on screen without any additional code.

# Going blinky

I've connected LED to ESP-12's GPIO15 pin. Firstly I will try to just light my light up.

```
print "Led ON"
io(po,15,1)
```

First try and it works! Just with one line, wireless, without compilation and without flashing. Wow!
`io` is just a IO operation function
`po` means 'pin out'
`15` is pin number
`1` is `high` state (`0` is `low`)

Next step is to make a delay between turning LED on and off:

```
io(po,15,1)
delay 500
io(po,15,0)
delay 500
io(po,15,1)
delay 500
io(po,15,0)
delay 500
io(po,15,1)
delay 500
io(po,15,0)
delay 500
```

And it blinks, but only few times with 0.5s delay. Last thing I need there is any loop here, and then I will have an awesome blinking machine!

```
For x = 1 to 60
    io(po,15,1)
    delay 500
    io(po,15,0)
    delay 500
Next x
```

This code lasts after 60 seconds. Let's make it infinite!

![Blinky](/images/mastering-led-with-basic-wirelessly/blink.gif){: .center-image}

```
variable = 0
Do
    io(po,15,variable % 2)
    delay 500
    variable = variable + 1
Loop until 0 'infinite
```

Success! But ESP's "IDE" becomes unavailable. The reason is that `delay` operation takes all processor time.
It's better to use timer functions, which uses interrupts to count time.

```
variable = 0

Timer 500, [blink]

[blink]
    io(po,15,variable % 2)
    variable = variable + 1
wait
```

Timer takes CPU time only every about 500ms, so it's possible to edit code and keep it running in the background.

