---
layout: post
title: Securing your Google service account key in builds
image: /images/securing-your-google-service-account-key-in-builds/padlock-597495_1920.jpg
author: azabost
crosspost: true
hidden: false
tags: [android, build]
---

Establishing a reliable continuous delivery and deployment process is often very important as it might greatly reduce the length of time needed for the validation and verification of the software product. This is also true for Android projects, especially the ones aimed at short time to market.

For me, one of the most crucial time savers is the [gradle-play-publisher](https://github.com/Triple-T/gradle-play-publisher) plugin, which allows me to publish the APKs as soon as the build is finished. However, you need the Google service account for that.

# With great power comes great responsibility #

The Google service account is an account that might be used by your applications to access all the Google APIs, including the ones for Google Play publishing ([Publishing API](https://developers.google.com/android-publisher/#publishing)). This API allows for example to:

* publish the APK (obviously)
* update the app listing (title, descriptions, images, videos, recent changes)
* change contact information (e-mail, phone number, website)

While granting this account the [required permissions](https://github.com/Triple-T/gradle-play-publisher#google-play-service-account), you cannot choose which particular apps it can access - it's either all or nothing. So if you have more than one application on your Google developer account, the service account will be able to reach them all.

Bearing this in mind, you should always protect the service account from abuse. The [documentation](https://developers.google.com/android-publisher/api_usage) also does warn you:
> We recommend not giving third parties access to any service accounts you may create. We especially recommend not giving access to any private keys for your service account. Doing so provides anonymous access to your account that can be shared with anyone.

![Padlock](/images/securing-your-google-service-account-key-in-builds/padlock-597495_1920.jpg){: .center-image}

# Automatic build deployment #

If you are going to use the Publishing API in your builds, you definitely should take the appropriate measures to keep the service account key secure. Depending on your company policies (e.g. repositories access), the size of your team, your customer needs and policies, you might consider:

* not storing the key in the repository
* storing the key in a password-protected archive in the repository
* storing the key in a separate repository
* not storing the key at all (wait, what? see the example below)
* ... etc.

# Example #

So how you can _not store the key at all_? Well, I have lied a bit. You must store it somewhere, but this example will show you how to store it as a secret value on a build server instead of a repository. This way you don't have to protect the repository itself, but the build server instead. Is it easier? It depends. But it's just one of the methods you can choose.

### Setting a secret value ###

Most of the automation servers like Jenkins or TeamCity have the ability to store a secret value, which you can use during the build. Whether it is really secure depends on the particular software you use, the build script (which may be printing the secret value to the build logs for example) and the access you give other people to the infrastructure and build configuration.

In this example, the secret value is stored on a TeamCity server and it will be available to the build in an environment variable.

![TeamCity secret value](/images/securing-your-google-service-account-key-in-builds/tc_secret_value.png){: .center-image}

### Reading the key in a build ###

There are plenty of ways you can read the environment variable during the build. This example uses a Gradle task to generate a file containing the key needed by the `gradle-play-publisher` plugin before the publication.

```groovy
apply plugin: 'com.android.application'
apply plugin: 'com.github.triplet.play'

class GenerateGooglePlayDeploymentJsonFile extends DefaultTask {
    File jsonFile

    @TaskAction
    def generate() {
        def envVar = "GOOGLE_API_JSON"
        def json = System.getenv(envVar)
        if (json) {
            jsonFile.write(json)
        } else {
            logger.log(LogLevel.ERROR, "You must use $envVar for Google Play publishing")
        }
    }
}

android {

    final googlePlayDeploymentJsonFile = new File("google_play_api.json")

    task generateGooglePlayDeploymentJsonFile(type: GenerateGooglePlayDeploymentJsonFile) {
        jsonFile = googlePlayDeploymentJsonFile
    }

    playAccountConfigs {
        defaultAccountConfig {
            jsonFile = googlePlayDeploymentJsonFile
        }
    }
    play {
        track = 'beta'
    }
    defaultConfig {
        playAccountConfig = playAccountConfigs.defaultAccountConfig
        // other config ...
    }
    buildTypes {
        release {
            // config ...
        }
        debug {
            // config ...
        }
    }
    productFlavors {
        prod {
            // config ...
        }
        dev {
            // config ...
        }
    }
    project.afterEvaluate {
        project.tasks.findAll {
            it.name.startsWith("generate") &amp;&amp; it.name.endsWith("PlayResources")
        }.forEach({
            logger.log(LogLevel.WARN, "Configuring Google Play deployment JSON file for task: $it")
            it.dependsOn generateGooglePlayDeploymentJsonFile
        })
    }
    // other config ...
}
```

The way it works is pretty straightforward:

1. Find some tasks generated by the publishing plugin.
    * The generated tasks names consist of the names of your release build variants. In this example there are: `devRelease` and `prodRelease`, which produce (among the others): `generateDevReleasePlayResources` and `generateProdReleasePlayResources`.
2. Make the generated tasks depend on the `generateGooglePlayDeploymentJsonFile` task, which expects the Google service account key (in JSON format) in the environment variable and saves it to a specified file.
3. Configure the publishing plugin to use the generated file.

Of course this simple script might be further improved and I encourage you to do it on your own.

### Publishing the app ###

The Gradle tasks used for the publication in this example are: `publishApkDevRelease` and `publishApkProdRelease`. Publishing the APKs with them is as simple as running these tasks like this:

```bash
gradle publishApkProdRelease
```

And you can see in the logs that it works:

```
[10:59:52][Step 1/1] Configuring Google Play deployment JSON file for task: task ':app:generateDevReleasePlayResources'
[10:59:52][Step 1/1] Configuring Google Play deployment JSON file for task: task ':app:generateProdReleasePlayResources'
...
[11:00:50][Step 1/1] :app:assembleProdRelease
[11:00:50][Step 1/1] :app:generateGooglePlayDeploymentJsonFile
[11:00:50][Step 1/1] :app:generateProdReleasePlayResources
[11:00:58][Step 1/1] :app:publishApkProdRelease
```

### Throw the key away ###

Now, having this process configured, you can safely delete the Google service account key file, so no one will ever abuse it (unless they somehow read it from the build server, which is your only worry now). In case your server dies and you lose the key, you can just invalidate it and generate another one in the [Google APIs Console](https://console.developers.google.com).

# Summary #

Protecting the service account key may be challenging, but it's very important and worth considering. You should assess the options you have, their pros and cons, the risks and profits. Keep in mind that any level of protection is better than no protection at all.
