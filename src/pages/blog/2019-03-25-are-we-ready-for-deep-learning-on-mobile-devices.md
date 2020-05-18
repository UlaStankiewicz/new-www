---
layout: post
title: Are we ready for deep learning on mobile devices?
author: radeks
hidden: false
crosspost: true
image: /images/are-we-ready-for-deep-learning-on-mobile-devices/top_img.jpg
tags: ['android', 'ios', 'mobile', 'tensorflow', 'deep learning', 'machine learning', 'ml kit']
---


Due to the rapid growth of deep learning possibilities, lots of smart people do their best to create more and more sophisticated algorithms that beat human’s performance in many areas. Luckily, a great chunk of their [work](https://arxiv.org/list/cs.LG/recent "repository with lots of papers") is throw open and waits for you to harness it in some fancy way. 

![](/images/are-we-ready-for-deep-learning-on-mobile-devices/top_img.jpg)

One way to take advantage of it is to make an inference of a pre-trained model in an environment that has plentiful data sources like mobile phones and their sensors. You can wonder why even bother with the inference on mobile app if you can easily make use of the internet connection and send data back and forth but we have to keep in mind that it is not very power efficient solution. What's more convincing is that because we make an inference on mobile then we can work offline and that also leads to low latency. Last but not least is privacy, sometimes we just don't want to send any data outside.

Unfortunately, on mobile devices there are also a few flawings.  Most important ones are relatively little computer power and tight memory constraints that prevents from the effective usage (or usage at all) of heavy models. 

## TensorFlow Lite for rescue!

With [TensorFlow Lite](https://www.tensorflow.org/lite) you can easily use your model on wide variety of devices like Android, iOS or Raspberry Pi. Hold on until you get to know how TensorFlow speeds up some  time consuming tasks. It uses [FlatBuffer](https://google.github.io/flatbuffers/) - a cross-platform library which allows to access serialized data without prior parsing and with preserving data structures that effect at unbelievable speed that is close to a raw struct access.  

Another thing is an extra kernel optimization for NEON on ARM. Besides it may leverage speed by a direct GPU integration or [Android Neural Network API](https://developer.android.com/ndk/guides/neuralnetworks). 

Next crucial component is a [post-training quantization](https://www.tensorflow.org/lite/performance/post_training_quantization) that enables to reduce a model size in tandem with 3x lower latency with a minimal impoverishment of accuracy. 

What’s more, at  [TensorFlow Dev Summit 2019](https://www.youtube.com/watch?v=DKosV_-4pdQ) we could get to know about some rapidly broadening use cases of TensorFlow Lite and also about making an inference even faster. 

TensorFlow Lite has been already enhancing a lot of apps that you've probably taken advantage of with features like a portrait mode on android camera, *Hey Google* in Google Assistant or just Google Photos.

Let’s now sum up the whole process of using TensorFlow model on mobile device. 

* Create a model or get existing one
* Convert the model into .tflite format
* Save the converted model on your device
* Load the model and make an inference
 
As you can see you can make it work by following four main steps. Yet there are lots of opportunities behind machine learning and deep learning in particular, so why not to take advantage of it. There is a whole bunch of things to cover but I’m sure that’s worth your time. With such great tools like TensorFlow/Keras and TensorFlow Lite you can deploy your current model to mobile devices much easier than it was possible before. Stay tuned for next posts about creating Android app with TensorFlow Lite! 
