---
layout: post
title: Working with Chrome Extensions
excerpt: Chrome Extensions can make your life easier whenever you want to add a new feature to the Chrome Browser. Working with extensions is quite easy. It’s just the good old JavaScript code and not much more. There are however few things worth taking into consideration while working with the extensions.
tags: ['Chrome Extensions', 'Chrome', 'JavaScript']
author: monika
comments: true
hidden: false
---

Chrome Extensions can make your life easier whenever you want to add a script to the Chrome Browser. Working with extensions is quite easy. It’s just the good old JavaScript code and not much more. There are, however, a few things worth taking into consideration while working with the extensions.

The [Chrome Extensions documentation](https://developer.chrome.com/extensions) is extensive and easy to read. There is also a [getting started](https://developer.chrome.com/extensions/getstarted) tutorial available.


## Declaring Files

All project files should be placed in one folder which should be uploaded as a zip file to the [Chrome Web Store](https://chrome.google.com/webstore/). The manifest.json file contains the metadata for all files. This means that any file will be simply ignored if it is not mentioned in the manifest. You should most probably start your project from creating the manifest file and declaring the most important fields. The instruction on how to do this can be found in the [documentation](https://developer.chrome.com/extensions). The majority of files should be declared in the [“content_scripts”](https://developer.chrome.com/extensions/content_scripts) field. The paths are relative to the package root. All JavaScript and CSS files should be declared there. The presence of the CSS files in this section is a bit misleading and in addition they also need to be declared in the [“web_accessible_resources”](https://developer.chrome.com/extensions/manifest/web_accessible_resources) field. The good part is that once a CSS file is declared in both fields it’s ready to be used (no additional links required).

Images should be declared only in the “web_accessible_resources” field. Whenever you want to use them in your extensions code, just call it like this: 

```javascript
var img = chrome.extension.getURL('ImageName'). 
```

The file name needs to be provided with the extension (e.g. .svg, .png, .jpg).

## Activating an Extension

To make an extension active you need to register it in the “matches” section of the [“content_scripts"](https://developer.chrome.com/extensions/content_scripts) field. You can also set a permission in the [“permissions”](https://developer.chrome.com/extensions/declare_permissions) field. I am using an “activeTab” permission because it prevents the Chrome browser from displaying a warning message that the aplication can access data on all websites. Otherwise the message pops up during the extension installation process. 

## Global Variables and Constants

Global variables or constants can be defined in a global object in a .js file like this:

```javascript
const config = {
   host: 'host',
   port: portNumber,
   logVisible: false,
}
```
To use them just type e.g. `config.host` in the script file.

## Security

Due to security reasons Chrome Extension restricts you from making certain actions. The [list of restrictions](https://developer.chrome.com/apps/contentSecurityPolicy) can be found in the documentation. 
You should, however, remember to protect your script from the external interference especially cross-site scripting attacks. For example be careful with using `innerHTML` for injecting content. Think of using `innerText` instead. Never retrieve HTTP content on an HTTPS page because the HTTP content might have been corrupted by a hostile network. The browser will display a warning message if you try to do this.

## Publishing Resources

Chrome extensions can be published in the [Chrome Web Store](https://chrome.google.com/webstore/), which is very handful - you don’t need to send the package to  users each time a new version is available. To publish an extensions you need to create a developer’s account. The cost of publishing is 5 USD (you pay for the whole service not for a single resource). The group publishing is also possible, then each developer needs to pay 5 USD to join the group. You can buy the service after you log in to the [Chrome Web Store](https://chrome.google.com/webstore/) and create a developer account. 

It takes up to one hour for the resource to publish. Each time an update is made, the [“version”](https://developer.chrome.com/extensions/manifest/version) field in the manifest needs to be changed. Note there is also a [“manifest_version”](https://developer.chrome.com/extensions/manifest/manifest_version) field which is a version of the manifest file. 