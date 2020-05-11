import cdk = require('@aws-cdk/core');
import { LambdaRestApi } from "@aws-cdk/aws-apigateway";
import { DnsValidatedCertificate } from "@aws-cdk/aws-certificatemanager";
import { CloudFrontAllowedMethods, CloudFrontWebDistribution, OriginProtocolPolicy, SecurityPolicyProtocol, ViewerCertificate } from "@aws-cdk/aws-cloudfront";
import * as lambda from "@aws-cdk/aws-lambda"
import { PublicHostedZone } from "@aws-cdk/aws-route53";
import { Duration } from "@aws-cdk/core";

export class ImageResizingStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const resizeFunction = new lambda.Function(this, 'ImageResizeFunction', {
            runtime: lambda.Runtime.NODEJS_10_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset("resize-lambda-handler"),
            memorySize: 1024,
            timeout: Duration.seconds(20)
        });

        const hardcodedAcceptHeaderToEnableBinaryResponse = "image/png";
        const apiGateway = new LambdaRestApi(this, 'ImageApi', {
            handler: resizeFunction,
            proxy: true,
            binaryMediaTypes: [hardcodedAcceptHeaderToEnableBinaryResponse]
        });

        const imagesCertificate = new DnsValidatedCertificate(this, 'BlogImagesCertificate', {
            region: 'us-east-1', // required by CF
            hostedZone: new PublicHostedZone(this, 'BlogImagesHostedZone', {
                zoneName: "images.brightinventions.pl"
            }),
            domainName: "images.brightinventions.pl"
        });

        const cache = new CloudFrontWebDistribution(this, 'ImageCache', {
            viewerCertificate: ViewerCertificate.fromAcmCertificate(imagesCertificate, {
                securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
                aliases: ["images.brightinventions.pl"]
            }),
            originConfigs: [{
                customOriginSource: {
                    // api gateway got this address - we could use custom domain
                    // https://26irz2q7ti.execute-api.eu-central-1.amazonaws.com/prod/
                    domainName: "26irz2q7ti.execute-api.eu-central-1.amazonaws.com",
                    originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY
                },
                originHeaders: {
                    "Accept": hardcodedAcceptHeaderToEnableBinaryResponse
                },
                originPath: "/prod",
                behaviors: [{
                    isDefaultBehavior: true,
                    allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                    defaultTtl: Duration.hours(4),
                    forwardedValues: {
                        queryString: true,
                        headers: ["Origin"]
                    }
                }]
            }]
        })
    }
}
