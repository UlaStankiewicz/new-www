import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import Axios from "axios";
import { Sharp } from "sharp";
import * as sharp from "sharp";
import { mapValues, flatten } from 'lodash'

const client = Axios.create({
    baseURL: "https://brightinventions.pl"
});

async function resizeImage(originImageData: Buffer, parameters: { [name: string]: string }) {
    const queryStringParameters = parameters;
    const intParam = (name: string) => queryStringParameters[name] ? parseInt(queryStringParameters[name]) : null;
    const param = (name: string) => queryStringParameters[name];

    const maxWidth = intParam('resize.maxWidth');
    const maxHeight = intParam('resize.maxHeight');

    let imageTransform: Buffer | Sharp = originImageData;
    const currentTransform = () => Buffer.isBuffer(imageTransform) ? sharp(imageTransform) : imageTransform;

    if (maxWidth || maxHeight) {
        console.log('resizing image to', { maxWidth, maxHeight });
        imageTransform = sharp(originImageData)
            .resize(maxWidth, maxHeight)
    }

    const expectedType = param('resize.imageType')?.toLowerCase();

    switch (expectedType) {
        case 'jpeg':
        case 'jpg':
            imageTransform = currentTransform().jpeg();
            break;
        case 'png':
            imageTransform = currentTransform().png();
            break;
        case 'webp':
            imageTransform = currentTransform().webp();
            break;
    }

    return Buffer.isBuffer(imageTransform) ? imageTransform : await imageTransform.toBuffer()
}

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const response = await client.get<Buffer>(event.path, {
            responseType: "arraybuffer",
            validateStatus: () => true
        });


        let result: APIGatewayProxyResult;

        let responseData: Buffer = response.data;
        const responseHeaders = response.headers || {};
        const multiValueHeaders = mapValues(responseHeaders, (value) => flatten([value]));

        if (response.status < 300) {
            const isImage = /^image/.test(responseHeaders['content-type']);

            const queryStringParameters = event.queryStringParameters || {};
            console.log('queryStringParameters', queryStringParameters);

            if (isImage) {
                responseData = await resizeImage(responseData, queryStringParameters);
            }

            if (queryStringParameters.timestamp) {
                multiValueHeaders.Expires = [];
                const oneYearInSeconds = 365 * 24 * 60 * 60;
                multiValueHeaders['Cache-Control'] = [`public, max-age=${oneYearInSeconds}`]
            }

            result = {
                statusCode: response.status,
                multiValueHeaders: {
                    ...multiValueHeaders,
                    'Content-Length': [responseData.length]
                },
                body: responseData && responseData.toString('base64'),
                isBase64Encoded: true
            }
        } else {
            result = {
                statusCode: response.status,
                multiValueHeaders: multiValueHeaders,
                body: responseData && responseData.toString('base64'),
                isBase64Encoded: true
            }
        }

        return result;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
