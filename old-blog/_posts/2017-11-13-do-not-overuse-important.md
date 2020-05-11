---
layout: post
title: "Important: do not overuse !important"
tags: [css, important, html, stylesheet]
comments: true
hidden: false
author: agnieszka
image: /images/do-not-overuse-important/important.jpg
---

You have created your CSS rule and found out that it didn’t take a desired effect. You checked the CSS selector and HTML code again to check if they correspond. Or you just opened the developer console in your browser, inspected the element and checked if your CSS rule was  present in the styles list. It turns out that it is there, but the declarations are strikethrough. This means you have just encountered some kind of CSS specificity issue. You could just add the `!important` flag to your declarations and have it done. Is it a good solution? Never. I do not say you should never use `!important` though. What I really want to say is that you should never use `!important` if you are not aware of the consequences.

![Image](/images/do-not-overuse-important/important.jpg){: .center-image}

First things first. If more than one selector applies to a certain HTML element, there is the order taken to decide which particular style to apply:

* CSS selector with `!important` flag,
* inline styles (the ones defined directly in your HTML tags),
* selector with a higher specificity,
* selector defined later in your css.
 

I will elaborate on them bottom up.

**1. The order of CSS rules**

This is quite obvious - the last rule takes it all.

```css
p { 
    color: red;
}
p { 
    color: blue;
}
```

In the example above the text in `p` will be blue. An important remark: when you include multiple css files (i.e. some vendor files), the order of link tags also matters. Always include your own css file as the last to make sure your styles take effect.

**2. Specificity**

So, what is it? In a nutshell, this is a kind of weight applied to each CSS selector based on the number of occurrences of each type of selector. It is a number in a system with a large base composed of three digits, which are as follows (from the most specific):

* the number of ID selectors
* the number of class selectors, attributes selectors, and pseudo-classes
* the number of type selectors and pseudo-elements.

An example might be helpful in clarifying this. In examples below <span style="color:red">ID selectors</span> are marked <span style="color:red">red</span>, <span style="color:blue">class</span>, <span style="color:blue">attributes</span>, and <span style="color:blue">pseudo-classes selectors</span> are marked <span style="color:blue">blue</span> and <span style="color:green">type</span> and <span style="color:green">pseudo-elements</span> selectors are marked <span style="color:green">green</span>.

* <span style="color:green">a</span><span style="color:blue">:hover</span> gives <span style="color:red">0</span>,<span style="color:blue">0</span>,<span style="color:green">1</span>
* <span style="color:green">html</span> <span style="color:blue">[type=button]</span> gives <span style="color:red">0</span>,<span style="color:blue">1</span>,<span style="color:green">1</span>
* <span style="color:green">body div div ul li</span><span style="color:red">#special-element</span> gives <span style="color:red">1</span>,<span style="color:blue">0</span>,<span style="color:green">5</span>

The commas between the digits are there so that you remember this is not a decimal number and the “digits” might be greater than decimal "9". Nonetheless, to make things easier, you can think of this number as a decimal. At least as long as your selectors don’t contain more that ten elements of the same type.

Notes:

* selectors inside the negation pseudo-class are counted like any other, but the negation itself does not count as a pseudo-class: <span style="color:green">input</span>:not(<span style="color:blue">[type=range]</span>) gives specificity of <span style="color:red">0</span>,<span style="color:blue">1</span>,<span style="color:green">1</span>,
* repeated occurrences of the same simple selector are allowed and do increase specificity,
* any inherited styles have specificity of <span style="color:red">0</span>,<span style="color:blue">0</span>,<span style="color:green">0</span>.


In my opinion it is important to understand the specificity and know why one selector is chosen among the others. And if you have already realized it, you can help yourself with a specificity calculator like [this one](https://specificity.keegan.st/).

**3. Inline styles**

Inline styles are the ones defined directly in your HTML tag. They always beat any other CSS declaration. Sometimes you may find the specificity presented as a four digit number where the thousand’s digit is for the inline styles (just as in the calculator previously mentioned), but I personally prefer to treat the inline styles separately.


**4. The `!important` flag** 

And finally we have the `!important` flag. It simply makes the CSS rule the most important. Have I said that inline styles beat any other CSS declaration? Well, `!important` flag beats the inline styles :) The only way to override a style tagged as important is to declare another rule and tag it as important as well. Just as with the inline styles, you should generally avoid using the `!important` flag. But after all it is there for some reason, so maybe sometimes it is acceptable?

Here is my subjective list of situations where you should not even think of using it.

* **In the site wide CSS.** They are likely to be overridden and you should not make it hard for your co-workers. And if you are going to continue work on this project (and you probably are), all the more you should not make it hard for yourself :)
* **In a library you are going to publish.** Try walking in the users’ shoes, it’s really common to override the library’s styles. If it’s hard and nasty, people will just not use the library.
* **As a first choice, when something doesn’t work as you expect it to.** You should always try to make your selectors more specific to achieve the goal.

On the other hand, are there any situations when you can use the `!important` flag and do not feel ashamed? You can use it in the user stylesheet (a piece of CSS defined for you as a web page visitor in your browser - people with special needs may use it to i.e. enlarge the text or change contrast). Some say this was the reason to introduced the flag though I haven’t found any reliable information about that.

What about the use cases strictly tight to development? The one I can think of is overriding styles defined inline or flagged as `!important`. However, if they appear in a third party library, it might be the perfect time to take a look at other libraries and reconsider your choice. If they sit in your project and you do not have privileges to change them, well, here you seem to have no choice. Of course, there is no need to mention the ones you have created. They do not exist. You just do not overuse `!important` :)

