---
layout: post
title: AWS CloudFormation patterns & practices with cloudform
excerpt: Recently we introduced cloudform – our open-source library that allows for managing AWS CloudFormation template files through TypeScript. Its core value proposition is to cope with the massive JSON files in a sane and familiar way – to treat it as any other TypeScript code we have in our project. But what does it actually mean? Let's look at some examples to check where this path can lead us to.
tags: [AWS, CloudFormation, open-source]
comments: true
author: adam
image: /images/cloudform/mindmap.jpg
---

Recently we introduced [`cloudform`](https://brightinventions.pl/blog/introducing-cloudform-tame-aws-cloudformation-templates/) – our [open-source library](https://www.npmjs.com/package/cloudform) that allows for managing [AWS CloudFormation](https://aws.amazon.com/cloudformation/) template files through TypeScript. Its core value proposition is to cope with the massive JSON files in a sane and familiar way – to treat it as any other TypeScript code we have in our project. But what does it actually mean? Let's look at some examples to check where this path can lead us to.

Just as a recap, the basic `cloudform` usage allows us to replace the lengthy and verbose JSON definition of AWS CloudFormation resource, like this:

```json
{
  "VPC": {
    "Type": "AWS::EC2::VPC",
    "Properties": {
      "CidrBlock": {
        "Fn::FindInMap": [
          "NetworkingConfig",
          "VPC",
          "CIDR"
        ]
      },
      "EnableDnsHostnames": true,
      "Tags": [
        {
          "Key": "Application",
          "Value": {
            "Ref": "AWS::StackName"
          }
        },
        {
          "Key": "Network",
          "Value": "Public"
        },
        {
          "Key": "Name",
          "Value": {
            "Fn::Join": [
              "-",
              [
                {
                  "Ref": "AWS::StackId"
                },
                "VPC"
              ]
            ]
          }
        }
      ]
    }
  }
}
```

into totally equivalent piece of TypeScript:

```typescript
{
  VPC: new EC2.VPC({
      CidrBlock: Fn.FindInMap('NetworkingConfig', 'VPC', 'CIDR'),
      EnableDnsHostnames: true,
      Tags: [
          new ResourceTag('Application', Refs.StackName),
          new ResourceTag('Network', 'Public'),
          new ResourceTag('Name', Fn.Join('-', [Refs.StackId, 'VPC']))
      ]
  })
}
```

Let's try something more.

## Get rid of repetitive values

Some references or other variables in our template repeat many times. With `cloudform` it's a bit more concise than in pure JSON – compare `Refs.StackName` to `{"Ref": "AWS::StackName"}`. We also often reference more complex constructs like concatenations – in pure JSON it quickly grows complex:
 
```json
{
  "Fn::Join": [
    "-",
    [
      "app-name-",
      {
        "Ref": "DeployEnv"
      }
    ]
  ]
}
```

With `cloudform` the same is expressed as 

```typescript
Fn.Join('-', ['app-name-', Fn.Ref('DeployEnv')])
```

But if we reference this kind of value several times, we can just save it as a TypeScript-level constant and just reference it in TypeScript:

```typescript
const envAppName = Fn.Join('-', ['app-name-', Fn.Ref('DeployEnv')])

export default cloudform({
    // ...
    ParameterValueSomewhereInResources: envAppName
})
```

![Structure and order for our AWS CloudFormation templates](/images/cloudform/mindmap.jpg)

## Get rid of repetitive resources

The same concept applies well for similar resources definitions. Let's say we need ten SQS queues defined in our infrastructure. In pure JSON it means we have to repeat the same queue definition piece over and over again, changing probably just a name parameter.

```json
{
  "NthQueue": {
    "Type": "AWS::SQS::Queue",
    "Properties": {
      "QueueName": {
        "Fn::Join": [
          "-",
          [
            {
              "Ref": "DeployEnv"
            },
            "nth-queue"
          ]
        ]
      },
      "RedrivePolicy": {
        "maxReceiveCount": 4,
        "deadLetterTargetArn": {
          "Fn::GetAtt": [
            "DefaultDeadLetterQueue",
            "Arn"
          ]
        }
      }
    }
  }
}
```

Going further with our previous concept of removing repetitions, we can apply pretty standard refactoring – extract a method. So we can define the piece of TypeScript that generates the Queue resource object and just invoke it within our template for each queue to be defined:

```typescript
const defineQueue = (name: string) => {
    return new SQS.Queue({
        QueueName: Fn.Join('-', [Fn.Ref('DeployEnv'), name, 'queue']),
        RedrivePolicy: {
            maxReceiveCount: 4,
            deadLetterTargetArn: Fn.GetAtt('DefaultDeadLetterQueue', 'Arn')
        }
    })
}

export default cloudform({
    Resources: {
        Queue1: defineQueue("first"),
        Queue2: defineQueue("second"),
        // ...
        QueueN: defineQueue("nth")
    }
})
```

## Get rid of static FindInMap

It often makes sense to have some common configuration values grouped together and possibly different depending on some parameter, for example a deployment environment like staging vs. production. In a pure JSON template we can use [`Fn::FindInMap`](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap.html) to reach the desired value where it is needed. We need to pass all the keys as a path to our value, possibly using parameter references (`Ref`) or other variables. But if our path is static, with `cloudform` we might get rid of verbose map accessing and replace it with a native TypeScript object instead.

So instead of:

```json
{
  "Mappings": {
    "NetworkingConfig": {
      "VPC": {
        "CIDR": "0.0.0.0/16"
      }
    }
  },
  "Resources": {
    "VPC": {
      "Type": "AWS::EC2::VPC",
      "Properties": {
        "CidrBlock": {
          "Fn::FindInMap": [
            "NetworkingConfig",
            "VPC",
            "CIDR"
          ]
        }
      }
    }
  }
}
```

we might create this mapping in TypeScript directly:

```typescript
const NetworkingConfig = {
    VPC: {
        CIDR: "0.0.0.0/16"
    }
}

export default cloudform({
    Resources: new EC2.VPC({
        CidrBlock: NetworkingConfig.VPC.CIDR
    })
})
```

## Split into multiple files

Nobody likes large source files. And complex environment definitions tend to grow large. In pure JSON, we are not able to split the file easily. There is an option to [import external snippets](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/create-reusable-transform-function-snippets-and-add-to-your-template-with-aws-include-transform.html), but it requires the snippet to be located on S3. Kind of cumbersome if we want to properly keep our infrastructure in source control and be serious in our [infrastructure-as-code approach](https://www.infoq.com/code-infrastructure).

With `cloudform` we are in the TypeScript world and nothing should stop us from treating parts of our template as TypeScript modules that can be imported into the final template. It might make sense to separate our networking stack module from the instances module and from the database module etc. – where each module might keep all the resources logically bound together – database access-related security groups might be defined together with the database, but ECS-related security groups might be defined together with the containers.

Let's look at the database module example, `database.ts`:

```typescript
export default {
  DatabaseInstanceParameters: new RDS.DBParameterGroup({
    Family: "postgres9.6"
  }),
  DatabaseInstance: new RDS.DBInstance({
    DBName: Fn.Join('-', ['db', Fn.Ref('DeployEnv')]),
    DBParameterGroupName: Fn.Ref('DatabaseInstanceParameters'),
    VPCSecurityGroups: [
        Fn.GetAtt('DatabaseSecurityGroup', 'GroupId')
    ]
    // ...
  }),
  DatabaseSecurityGroup: new EC2.SecurityGroup({
    // ...
  })
}
```

And its usage within the actual template:

```typescript
import databaseResources from './database'

export default cloudform({
  Resources: Object.assign({}, databaseResources, /* and possibly more */)
})
```

## Forget the actual JSON at all

With all the `cloudform` goodies around, we might forget the existence of the JSON file within our sources. It might make sense to generate it on the fly as a part of our build or deployment process. How about adding the template generation task to our NPM scripts:

```json
{
  "generate-aws-template": "cloudform cloudformation/.ts > .build/template.out",
  "deploy": "npm run generate-aws-template && <proceed with deployment using .build/template.out>"
}
```

There are probably a lot of other creative ways to use `cloudform` to simplify and manage our AWS CloudFormation templates. Feel free to share your ideas!
