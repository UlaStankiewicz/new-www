---
layout: post
title: Image classification with TensorFlow Lite on Android
author: radeks
crosspost: true
hidden: false
image: /images/image-classification-tensorflowlite-android/surf1.jpg
tags: ['android', 'tensorflow lite', 'deep learning', 'image classification']
---

As I've already listed in my recent [blog post](https://brightinventions.pl/blog/are-we-ready-for-deep-learning-on-mobile-devices/) there are lots of advantages of making inference directly on a mobile device instead of using cloud solutions. Because of mobile devices' computation limitations, we can't migrate all of the available models to work on mobile. Unfortunately, plenty of them won't work on mobile devices but that's fine because we often don't need these heavy models on mobile devices. In this blog post, we will create a simple Android application that will take advantage of [MobileNetV2](https://arxiv.org/abs/1801.04381) that was pre-trained on ImageNet.

![](/images/image-classification-tensorflowlite-android/surf1.jpg)


## Let's make our hands dirty...

In our Android app project we need to add TFLite dependency to `build.gradle` file. 

```
implementation 'org.tensorflow:tensorflow-lite:1.13.1'
```

and the undermentioned snippet to prevent compressing the model.

```  
aaptOptions {  
    noCompress "tflite"  
    noCompress "lite"  
}
```

The next step is to get a model for the image classification problem. One way is to create your own or take pre-trained one from [here](https://www.tensorflow.org/lite/guide/hosted_models) and put it to the `assets` folder. We will be using customized pre-trained MobileNetV2 that I've created for the sake of this demo. Our model will be able to or at least it should distinguish 🌊 _kitesurfing, windsurfing_, and _surfing_ 🏄‍♂️.  You can download this model as well as labels from my [git repository](https://github.com/ares97/tflitedemo-mobilenetv2-imagenet-classification/tree/master/app/src/main/assets).

![](/images/image-classification-tensorflowlite-android/kite.jpg)

### Dive into the code

In order to make use of the prepared model we need to somehow import it into code. Let's use `tf.lite.Interpreter`   interface for the model. 

You can set up an interpreter in many ways, one recommended on [TF website](https://www.tensorflow.org/lite/models/image_classification/android) is to make use of `MappedByteBuffer`.

```kotlin
@Throws(IOException::class)  
private fun getModelByteBuffer(assetManager: AssetManager, modelPath: String): MappedByteBuffer {  
    val fileDescriptor = assetManager.openFd(modelPath)  
    val inputStream = FileInputStream(fileDescriptor.fileDescriptor)  
    val fileChannel = inputStream.channel  
    val startOffset = fileDescriptor.startOffset  
    val declaredLength = fileDescriptor.declaredLength  
    return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength) 
}
```

and then...

```kotlin
model = Interpreter(loadModelFile(activity))
```

Unfortunately using `MappedByteBuffer` as an argument is already deprecated and will be deleted in future releases but you can solve this problem by delivering ByteBuffer instead and it is as simple as invoking `.asReadOnlyBuffer()` on `loadModelFile` method.

Next step is to read the file with labels. You can easily grab them with:

```kotlin
@Throws(IOException::class)  
private fun getLabels(assetManager: AssetManager, labelPath: String): List<String> {  
    val labels = ArrayList<String>()  
    val reader = BufferedReader(InputStreamReader(assetManager.open(labelPath)))  
    while (true) {
        val label = reader.readLine() ?: break
        labels.add(label)
    }  
    reader.close()  
    return labels  
}
``` 

 
The last thing is to create a method that will take an image as an argument and return a list of labels with assigned probabilities to them.

```kotlin
fun recognize(bitmap: Bitmap): List<Recognition>{
```

Because our model expects the exact input shape (224x224 pixels) we need to rescale a delivered bitmap to fit into these constraints. 

```kotlin
	val scaledBitmap =  Bitmap.createScaledBitmap(bitmap, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, false)
```

Next, we need to create byteBuffer of appropriate size that will be passed as an argument to the model.

```kotlin
	val byteBuffer = ByteBuffer  
	    .allocateDirect(  
	                BATCH_SIZE *  		 // amount of images per single processing
	                MODEL_INPUT_SIZE *   // img height
	                MODEL_INPUT_SIZE *   // img width
	                BYTES_PER_CHANNEL *  // size of float = 4
	                PIXEL_SIZE           // r+g+b = 1+1+1
	  )  
	    .apply { order(ByteOrder.nativeOrder()) } // force device's native order (BIG_ENDIAN or LITTLE_ENDIAN)
```    

And load `byteByffer` with the image data as _floating point numbers_. In order to decode color (ignoring alpha) in each pixel on a bitmap, we need to mask the least significant 8 bits and its multiple.

```kotlin
	val pixelValues = IntArray(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE)  
	bitmap.getPixels(pixelValues, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)  
  
	var pixel = 0  
	for (i in 0 until MODEL_INPUT_SIZE) {  
	    for (j in 0 until MODEL_INPUT_SIZE) {  
	        val pixelValue = pixelValues[pixel++]  
	        byteBuffer.putFloat((pixelValue shr 16 and 0xFF) / 255f)  
	        byteBuffer.putFloat((pixelValue shr 8 and 0xFF) / 255f)  
	        byteBuffer.putFloat((pixelValue and 0xFF) / 255f)  
	    }  
	}
```


Finally, we can pass _byteBuffer_ to the model. The interpreter expects for the second argument container for results and it is _array_ of _float arrays_ (_array_ for each image and each one will contain _float array_ of probabilities).

```kotlin
	val results = Array(BATCH_SIZE) { FloatArray(labels.size) }
	model.run(byteBuffer, results)
	return parseResults(results)
}
```

The last step is to bond probability with a proper class.

```kotlin
private fun parseResults(result: Array<FloatArray>): List<Recognition> {  
  
    val recognitions = mutableListOf<Recognition>()  
  
    labels.forEachIndexed { index, label ->  
        val probability = result[0][index]  
        recognitions.add(Recognition(label, probability))  
    }  
  
  return recognitions.sortedByDescending { it.probability }  
}
```

where _Recognition_ is our humble result data class.

```kotlin
data class Recognition(  
    val name: String,  
    val probability: Float  
) {  
    override fun toString() =  
        "$name : ${probability*100}%"  
}
```

###### Don't forget that there are many things you should consider to make it work well i.e. handling a camera orientation or using post-training quantization if you need higher speed with a bit lower accuracy and lighter.

## It’s showtime!

The above code is a minimalistic version for getting TFLite solving for us _image classification_ problem. With the provided model you can successfully classify all photos that are in this blog post. 📸 
You can find the demo [here](https://github.com/ares97/tflitedemo-mobilenetv2-imagenet-classification).



![](/images/image-classification-tensorflowlite-android/windsurf.jpg)



