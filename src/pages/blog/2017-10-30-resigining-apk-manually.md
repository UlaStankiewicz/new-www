---
layout: post
title: Signing APK file manually
author: radek
hidden: true
tags: ['android', 'signing', 'apk', 'application publishing']
---

Either you upload your app first time or update it, the application has to fulfill several requirements before it will be uploaded to the store (check [upload](https://support.google.com/googleplay/android-developer/answer/113469) and [update](https://support.google.com/googleplay/android-developer/answer/113476) requirements list). In this post let’s focus on signing an application.

## About signing an application ##
> “Android requires that all APKs be digitally signed with a certificate before they can be installed”

What does it mean? Generally speaking, Android can identify an author of the application based on the certificate and recognize which application it can trust. It allows trusted application to be easily upgraded when an update is available in the store, allows applications with the same certificate share processes and, with using signature-based permissions checks, your applications can share code and data in a secure manner. Also mind that signing is required not only to be uploaded to the store but also to be even installed on Android OS. This means even your debug versions of application got their own certificates. Nevertheless, we don’t need to worry about that because compiler signs it with debug certificate every time we build the project so we could not worry about the process and just test functionality. Another thing is no certificate authority is needed and self-signed certificates might be used to sign your application. The certificate contains also the expiration date. It is checked at installation time, so when your certificate expires app will function normally, but could not be updated anymore.

## Keystore ##
What is keystore?
> “This class represents a storage facility for cryptographic keys and certificates.”

In practice keystore is a file that contains a block of encrypted data. It is defined with two aspects: keystore name and an alias. One file can store multiple aliases, so app certificate is described with keystore-alias key pair. Under alias keystore stores private key and other metadata identifying the owner of the key, such as Full Name, Organization, City, etc. Saving these data is not required.

To generate a keystore you need keytool which is provided with Java JDK. This is standard command generating keystore:  
`keytool -genkey -v -keystore mySecretKeystore.keystore -alias myAlias -keyalg RSA -keysize 2048 -validity 10000`  
where keystore name and alias name are up to you. Keyalg describes the algorithm used to generate keypair, you may choose different as you wish, same for keysize. Validity, specified in days, should be at least 25 years (Google Play requirements).

## Signing ##

Signing an application might go 2 ways: sign with Gradle/ Android Studio or sign manually. Let's take a look at manually signing. For that, you'll need `apksigner` tool which is located in your Android SDK directory under `/build-tools/{VERSION}/` .

For signing your app you need 2 files, `.apk` and `.keystore`

```
myAwesomeApp.apk
mySecretKeystore.keystore
```

If you have `.keystore` file you can list it's certificates with `keytool`:  
`keytool -list -keystore ./mySecretKeystore.keystore -v -storepass mySecretPassword`

```
Valid from: Sun Mar 18 23:40:12 CET 2012 until: Thu Mar 19 23:40:12 CET 2037
Certificate fingerprints:
	 MD5:  59:**:**:**:**:**:**:**:**:**:**:**:**:**:**:EC
	 SHA1: E2:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:9B
	 SHA256: 07:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:**:6D
	 Signature algorithm name: SHA1withRSA
	 Version: 3
```
Result contains informations about fingerprints and validation dates.

Now sign your `.apk` file with `apksigner` tool which comes with Android SDK tools:  
`apksigner sign --ks ./mySecretKeystore.keystore --out ./myAwesomeApp-signed.apk ./myAwesomeApp.apk`   

The last step is to zip align `.apk`. The alignment is an integer that defines the byte-alignment boundaries. This must always be 4, which provides 32-bit alignment.
`zipalign 4 ./myAwesomeApp-signed.apk myAwesomeApp-aligned.apk`

And then check result with `apksigner verify`:  
`apksigner verify -v --print-certs ./myAwesomeApp-signed.apk`  
```
Signer #1 certificate SHA-256 digest: 07************************************************************6d
Signer #1 certificate SHA-1 digest: e2************************************9b
Signer #1 certificate MD5 digest: 59****************************ec
Signer #1 key algorithm: RSA
Signer #1 key size (bits): 1024
Signer #1 public key SHA-256 digest: 92************************************************************de
Signer #1 public key SHA-1 digest: 67************************************fe
Signer #1 public key MD5 digest: 92****************************2d
```

## Dealing with legacy apps - case study ##

Happened to me once I got to upload new application as an update of old version developed by some else. As was mentioned, when updating app the certificate should be the same, so I received keystore file in `.p12` extension, which represents `pkcs12` format, commonly used to store keys for iOS applications. Why was it needed in this case? It turned out the previous version of an app was developed with Adobe Flash Professional CC and key generated with Adobe Air Certificate Generator as a standard procedure few years ago. Why is it important? Well... ***Android applications signing process was changing over time***, which means ***good luck with signing legacy apps***.

`keytool` allows you to convert `.p12` to `JKS` (Java KeyStore) format with `importkeystore` option. Does it solve the problem? Unfortunately not. `apksigner` changes fingerprint in app while signing with imported keystore and Google Play will reject your app. Going through exactly the same workflow described above printing certificates shows two different ones.   
keystore: `SHA1: E2: ... :9B`   
apk: `SHA1: 0B: ... :9A`

The answer is to use `jarsigner` tool.

An APK file is an archive. Among others it has “META-INF” directory containing three files:
* `MANIFEST.MF`: the Manifest file
* `CERT.RSA`: The certificate of the application.
* `CERT.SF`: The list of resources and SHA-1 digest of the corresponding lines in the MANIFEST.MF file

For signing with `jarsigner` we have to:   
1. edit `.apk` file and delete `META-INF` directory.   
`zip -d myAwesomeApp.apk "META-INF/*"`   
2. sign with `jarsigner`   
`jarsigner -keystore pkcs12Keystore.p12 -storepass mySecretPassword -storetype pkcs12 myAwesomeApp.apk myAlias`
3. zip align file   
`zipalign 4 myAwesomeApp.apk myAwesomeApp-aligned.apk`

That is it. Now fingerprints matches   
keystore: `SHA1: E2: ... :9B`   
apk: `SHA1: E2: ... :9B`
