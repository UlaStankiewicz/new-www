---
layout: post
title: Writing a blog post
author: piotr
hidden: true
tags: [blog, jekyll, github]
---

Our blog is using [Jekyll](https://jekyllrb.com/) and is hosted on [Github](https://github.com/bright/new-www).

# Verify you have access to github repository

1. Open [https://github.com/bright/new-www](https://github.com/bright/new-www/tree/gh-pages/_posts).
1. Click `Create new file` button. If the button is not there please ask [Ula 🚴‍](https://bright-inventions.slack.com/messages/D3B8FTX71), [Michał](https://bright-inventions.slack.com/messages/D04QP07B4) or [Daniel](https://bright-inventions.slack.com/messages/D04QP10LU) for access.

3. If you have access to the repository pick your way:
 - [I can browse the web](#web)
 - [I know `git`](#git)
 - [I know `git`, `bundler` and other stuff](#git-bundler)

# <a name="web"></a>I can browse web

1. Open [https://github.com/bright/new-www](https://github.com/bright/new-www/tree/gh-pages/_posts)
2. Click `Create new file` and pick a name in format `yyyy-mm-dd-blog-post-title.md` where:
     - `yyyy`, `mm`, `dd` are published year, month and day of month respectively e.g. 2017-10-04
     - `blog-post-title` is the blog post title e.g. writing-a-blog-post

3. Paste the following content into the edit form:

```
---
layout: post
title: A human readable title of post
author: piotr
hidden: true
tags: [blog]
---

My blog post content.
```

The `title:` is self-explanatory nevertheless take special care to name your content nicely. 

The `author:` section has to have a value defined in [authors.yml](https://github.com/bright/new-www/blob/gh-pages/_data/authors.yml) file. If you are not there **edit the file and send a pull request** or ask [someone](https://bright-inventions.slack.com/messages/C3ELVL58F) to create entry for you. 

The `tags:` can and should have multiple keywords e.g. `tags: blog programming bright` describing blog post content. Tags can be specified as a YAML list or a space-separated string.

The `hidden: true` flag removes the post from [the blog page](http://brightinventions.pl/blog/). A page marked with `hidden: true` is still going to be available when you enter its full url into browser address bar (e.g http://brightinventions.pl/blog/do-more-with-what-you-have/). This is useful when you'd like to ask [someone](https://bright-inventions.slack.com/messages/C3ELVL58F) for review. 

When you have replaced `My blog post content.` with your thoughts, findings, article or rambling hit `Preview` button to get a rough idea on how your post is formatted.

If you don't find any obvious mistakes you can `Commit new file` which will save the content so that [someone](https://bright-inventions.slack.com/messages/C3ELVL58F) can review it. The post is going to be available under http://brightinventions.pl/blog/`blog-post-title` url after a minute or so. 

If you would like to correct some errors or remove `hidden: true` you can find the file and hit the <button><svg aria-hidden="true" class="octicon octicon-pencil" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M0 12v3h3l8-8-3-3-8 8zm3 2H1v-2h1v1h1v1zm10.3-9.3L12 6 9 3l1.3-1.3a.996.996 0 0 1 1.41 0l1.59 1.59c.39.39.39 1.02 0 1.41z"></path></svg></button> button e.g. [https://github.com/bright/new-www/blob/gh-pages/_posts/2017-09-13-do-more-with-what-you-have.md](https://github.com/bright/new-www/blob/gh-pages/_posts/2017-09-13-do-more-with-what-you-have.md)

After edits are made hitting the `Commit changes` button will save the changes and publish them soon after. 

# <a name="git"></a>I know `git`

1. [Clone the repository](https://github.com/bright/new-www). 
1. When you have a rough idea what you'd like the post to be about use create a new file under `_drafts` folder named `yyyy-mm-dd-blog-post-title.md` where:
     - `yyyy`, `mm`, `dd` are published year, month and day of month respectively e.g. 2017-10-04
     - `blog-post-title` is the blog post title e.g. writing-a-blog-post
     - the file starts with the following content:

```
---
layout: post
title: A human readable title of post
author: piotr
hidden: true
tags: [blog]
---

```

Note that the `author:` section has to have a value defined in [authors.yml](https://github.com/bright/new-www/blob/gh-pages/_data/authors.yml) file. If you are not there **edit the file and send a pull request**. 
The `tags:` can have multiple values e.g. `tags: blog programming bright`

3. You can commit and push `_draft` whenever you need. The content is **not going** to be visible on the site.
1. Once you are ready to share your content with the world you need to move your blog post file from `_drafts` folder into `_posts` folder. Consider using pull request or hiding the post from listing with `hidden: true` included in [front matter](https://jekyllrb.com/docs/frontmatter/)
1. If you and your fellow 💍 colleagues are happy with how your brand new, shiny 💎 post looks like then merge the pull request or remove `hidden: true`

# <a name="git-bundler"></a>I know `git`, `bundler` and ~~nerdy~~ techie stuff

1. [Clone the repository](https://github.com/bright/new-www). 
1. [Install rvm](https://rvm.io/rvm/install)
1. Install ruby >= 2.x.x
1. `bundle install`
1. `bundle exec jekyll s` 👍
1. Use [jekyll docks](https://jekyllrb.com/) to figure rest out
1. Consider using pull request for post review 🤓

# Images and stock photos

We all know how a nice picture can enhance post content, decrease bounce rate and attract visitors. Please pay special attention to license of the images your posts include. 

There are services which offer free stock photos:
- [Hacker news list](https://news.ycombinator.com/item?id=15602538)
  - [Stock snap](https://stocksnap.io/)
  - [Free images](http://www.free-images.cc/)
  - [Unsplash](https://unsplash.com/)
  - and many more...
- [Pexels](https://www.pexels.com/) Free stock photos you can use everywhere. ✓ Free for commercial use ✓ No attribution required 
- [Pixabay](https://pixabay.com) Over 1,156,004 high quality photos, illustrations, and vector graphics. Free for commercial use. No attribution required.

To include a picture in your post you can add the image to a folder named after your blog post title e.g. `/images/writing-a-blog-post/`

In order to include the image you can use markdown or html e.g.:
```
![Image Title](/images/writing-a-blog-post/pexels-photo-296115.jpeg)
```

![Image Title](/images/writing-a-blog-post/pexels-photo-296115.jpeg)

**When you use an image in the blog post please set the path to the `image` in the front-matter like so:**

`2017-10-23-the-importance-of-timeouts.md`:

```
---
layout: post
...
image: /images/the-importance-of-timeouts/man-clock.jpeg
...
---
```

This will make share page pick up the image 👍

# Crossposting

If you include `crosspost: https://my-blog-post/:category/:year/:month/:day` in your `authors.yml` section. Then you can set `crosspost: true` to add a link to your blog.

Example:

`authors.yml`:

```
piotr:
  crosspost: https://miensol.pl/:categories/:year/:month/:day/:title.html
  ...
```


`2017-10-23-the-importance-of-timeouts.md`:

```yaml
---
layout: post
title: The importance of timeouts
author: piotr
hidden: false
tags: [server, request, timeout, query, resiliency, spring, boot]
comments: true
crosspost: true
image: /images/the-importance-of-timeouts/man-clock.jpeg
---
```


